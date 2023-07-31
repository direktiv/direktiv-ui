import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/design/Dialog";
import { Home, PlusCircle } from "lucide-react";
import { MirrorSchema, MirrorSchemaType } from "~/api/namespaces/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/design/Select";
import { SubmitHandler, useForm } from "react-hook-form";
import { Tabs, TabsList, TabsTrigger } from "~/design/Tabs";

import Button from "~/design/Button";
import FormErrors from "~/componentsNext/FormErrors";
import InfoTooltip from "./InfoTooltip";
import Input from "~/design/Input";
import { fileNameSchema } from "~/api/tree/schema";
import { pages } from "~/util/router/pages";
import { useCreateNamespace } from "~/api/namespaces/mutate/createNamespace";
import { useListNamespaces } from "~/api/namespaces/query/get";
import { useNamespaceActions } from "~/util/store/namespace";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type FormInput = {
  name: string;
} & MirrorSchemaType;

const mirrorAuthTypes = ["none", "ssh", "token"] as const;

const NamespaceCreate = ({ close }: { close: () => void }) => {
  const { t } = useTranslation();
  const [isMirror, setIsMirror] = useState<boolean>(false);
  const [authType, setAuthType] = useState<string>("none");
  const { data } = useListNamespaces();
  const { setNamespace } = useNamespaceActions();
  const navigate = useNavigate();

  const existingNamespaces = data?.results.map((n) => n.name) || [];

  const nameSchema = fileNameSchema.and(
    z.string().refine((name) => !existingNamespaces.some((n) => n === name), {
      message: t("components.namespaceCreate.nameAlreadyExists"),
    })
  );

  const simpleNamespaceResolver = zodResolver(z.object({ name: nameSchema }));

  const mirrorResolver = zodResolver(
    MirrorSchema.and(z.object({ name: nameSchema }))
  );

  const {
    register,
    handleSubmit,
    formState: { isDirty, errors, isValid, isSubmitted },
  } = useForm<FormInput>({
    resolver: isMirror ? mirrorResolver : simpleNamespaceResolver,
  });

  const { mutate: createNamespace, isLoading } = useCreateNamespace({
    onSuccess: (data) => {
      setNamespace(data.namespace.name);
      navigate(
        pages.explorer.createHref({
          namespace: data.namespace.name,
        })
      );
      close();
    },
  });

  const onSubmit: SubmitHandler<FormInput> = ({
    name,
    ref,
    url,
    passphrase,
    publicKey,
    privateKey,
  }) => {
    createNamespace({
      name,
      mirror: { ref, url, passphrase, publicKey, privateKey },
    });
  };

  // you can not submit if the form has not changed or if there are any errors and
  // you have already submitted the form (errors will first show up after submit)
  const disableSubmit = !isDirty || (isSubmitted && !isValid);

  const formId = `new-namespace`;
  return (
    <>
      <DialogHeader>
        <DialogTitle>
          <Home /> {t("components.namespaceCreate.title")}
        </DialogTitle>
      </DialogHeader>

      <Tabs className="w-[400px]" defaultValue="namespace">
        <TabsList>
          <TabsTrigger value="namespace" onClick={() => setIsMirror(false)}>
            Namespace
          </TabsTrigger>
          <TabsTrigger value="mirror" onClick={() => setIsMirror(true)}>
            Mirror
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="my-3">
        <FormErrors errors={errors} className="mb-5" />
        <form
          id={formId}
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-y-5"
        >
          <fieldset className="flex items-center gap-5">
            <label
              className="w-[90px] overflow-hidden text-right text-[14px]"
              htmlFor="name"
            >
              {t("components.namespaceCreate.label.name")}
            </label>
            <Input
              id="name"
              data-testid="new-namespace-name"
              placeholder={t("components.namespaceCreate.placeholder.name")}
              {...register("name")}
            />
          </fieldset>

          {isMirror && (
            <>
              <fieldset className="flex items-center gap-5">
                <label
                  className="w-[90px] flex-row overflow-hidden text-right text-[14px]"
                  htmlFor="url"
                >
                  {t("components.namespaceCreate.label.url")}
                  <InfoTooltip>
                    {t("components.namespaceCreate.tooltip.url")}
                  </InfoTooltip>
                </label>
                <Input
                  id="url"
                  data-testid="new-namespace-url"
                  placeholder={t(
                    authType === "ssh"
                      ? "components.namespaceCreate.placeholder.gitUrl"
                      : "components.namespaceCreate.placeholder.httpUrl"
                  )}
                  {...register("url")}
                />
              </fieldset>

              <fieldset className="flex items-center gap-5">
                <label
                  className="w-[90px] overflow-hidden text-right text-[14px]"
                  htmlFor="ref"
                >
                  {t("components.namespaceCreate.label.ref")}
                  <InfoTooltip>
                    {t("components.namespaceCreate.tooltip.ref")}
                  </InfoTooltip>
                </label>
                <Input
                  id="ref"
                  data-testid="new-namespace-ref"
                  placeholder={t("components.namespaceCreate.placeholder.ref")}
                  {...register("ref")}
                />
              </fieldset>

              <fieldset className="flex items-center gap-5">
                <label
                  className="w-[90px] overflow-hidden text-right text-[14px]"
                  htmlFor="ref"
                >
                  {t("components.namespaceCreate.label.authType")}
                </label>
                <Select value={authType} onValueChange={setAuthType}>
                  <SelectTrigger variant="outline" className="w-full">
                    <SelectValue
                      placeholder={t(
                        "components.namespaceCreate.placeholder.authType"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {mirrorAuthTypes.map((option) => (
                      <SelectItem
                        key={option}
                        value={option}
                        onClick={() => setAuthType(option)}
                      >
                        {t(`components.namespaceCreate.authType.${option}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </fieldset>

              {authType === "token" && (
                <fieldset className="flex items-center gap-5">
                  <label
                    className="w-[90px] overflow-hidden text-right text-[14px]"
                    htmlFor="token"
                  >
                    {t("components.namespaceCreate.label.token")}
                    <InfoTooltip>
                      {t("components.namespaceCreate.tooltip.token")}
                    </InfoTooltip>
                  </label>
                  <Input
                    id="token"
                    data-testid="new-namespace-token"
                    placeholder={t(
                      "components.namespaceCreate.placeholder.token"
                    )}
                    {...register("passphrase")}
                  />
                </fieldset>
              )}

              {authType === "ssh" && (
                <>
                  <fieldset className="flex items-center gap-5">
                    <label
                      className="w-[144px] overflow-hidden text-right text-[14px]"
                      htmlFor="passphrase"
                    >
                      {t("components.namespaceCreate.label.passphrase")}
                      <InfoTooltip>
                        {t("components.namespaceCreate.tooltip.passphrase")}
                      </InfoTooltip>
                    </label>
                    <Input
                      id="passphrase"
                      data-testid="new-namespace-passphrase"
                      placeholder={t(
                        "components.namespaceCreate.placeholder.passphrase"
                      )}
                      {...register("passphrase")}
                    />
                  </fieldset>
                  <fieldset className="flex items-center gap-5">
                    <label
                      className="w-[144px] overflow-hidden text-right text-[14px]"
                      htmlFor="public-key"
                    >
                      {t("components.namespaceCreate.label.publicKey")}
                      <InfoTooltip>
                        {t("components.namespaceCreate.tooltip.publicKey")}
                      </InfoTooltip>
                    </label>
                    <Input
                      id="public-key"
                      data-testid="new-namespace-pubkey"
                      placeholder={t(
                        "components.namespaceCreate.placeholder.publicKey"
                      )}
                      {...register("publicKey")}
                    />
                  </fieldset>

                  <fieldset className="flex items-center gap-5">
                    <label
                      className="w-[144px] overflow-hidden text-right text-[14px]"
                      htmlFor="private-key"
                    >
                      {t("components.namespaceCreate.label.privateKey")}
                      <InfoTooltip>
                        {t("components.namespaceCreate.tooltip.privateKey")}
                      </InfoTooltip>
                    </label>
                    <Input
                      id="private-key"
                      data-testid="new-namespace-privkey"
                      placeholder={t(
                        "components.namespaceCreate.placeholder.privateKey"
                      )}
                      {...register("privateKey")}
                    />
                  </fieldset>
                </>
              )}
            </>
          )}
        </form>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost">
            {t("components.namespaceCreate.cancelBtn")}
          </Button>
        </DialogClose>
        <Button
          data-testid="new-namespace-submit"
          type="submit"
          disabled={disableSubmit}
          loading={isLoading}
          form={formId}
        >
          {!isLoading && <PlusCircle />}
          {t("components.namespaceCreate.createBtn")}
        </Button>
      </DialogFooter>
    </>
  );
};

export default NamespaceCreate;
