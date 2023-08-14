import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/design/Dialog";
import { Diamond, PlusCircle } from "lucide-react";
import {
  ServiceFormSchema,
  ServiceFormSchemaType,
} from "~/api/services/schema";
import { SubmitHandler, useForm } from "react-hook-form";

import Button from "~/design/Button";
import FormErrors from "~/componentsNext/FormErrors";
import Input from "~/design/Input";
import { useCreateService } from "~/api/services/mutate/create";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

const CreateService = ({
  path,
  close,
  unallowedNames,
}: {
  path?: string;
  close: () => void;
  unallowedNames?: string[];
}) => {
  const { t } = useTranslation();

  const { mutate: createService, isLoading } = useCreateService({
    onSuccess: () => {
      close();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { isDirty, errors, isValid, isSubmitted },
  } = useForm<ServiceFormSchemaType>({
    resolver: zodResolver(ServiceFormSchema),
  });

  const onSubmit: SubmitHandler<ServiceFormSchemaType> = ({
    name,
    cmd,
    image,
    minscale,
    scale,
  }) => {
    console.log("🚀", 1);
    createService({
      name,
      cmd,
      image,
      minscale: 2,
      scale: 2,
    });
  };

  // you can not submit if the form has not changed or if there are any errors and
  // you have already submitted the form (errors will first show up after submit)
  const disableSubmit = !isDirty || (isSubmitted && !isValid);

  const formId = `new-service-${path}`;
  return (
    <>
      <DialogHeader>
        <DialogTitle>
          <Diamond /> {t("pages.services.create.title")}
        </DialogTitle>
      </DialogHeader>

      <div className="my-3">
        <FormErrors errors={errors} className="mb-5" />
        <form
          id={formId}
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col space-y-5"
        >
          <fieldset className="flex items-center gap-5">
            <label className="w-[90px] text-right text-[14px]" htmlFor="name">
              {t("pages.services.create.nameLabel")}
            </label>
            <Input
              id="name"
              placeholder={t("pages.services.create.namePlaceholder")}
              {...register("name")}
              autoComplete="off"
            />
          </fieldset>
          <fieldset className="flex items-center gap-5">
            <label className="w-[90px] text-right text-[14px]" htmlFor="name">
              {t("pages.services.create.imageLabel")}
            </label>
            <Input
              id="image"
              placeholder={t("pages.services.create.imagePlaceholder")}
              {...register("image")}
            />
          </fieldset>
          <fieldset className="flex items-center gap-5">
            <label className="w-[90px] text-right text-[14px]" htmlFor="name">
              {t("pages.services.create.cmdLabel")}
            </label>
            <Input
              id="cmd"
              placeholder={t("pages.services.create.cmdPlaceholder")}
              {...register("cmd")}
            />
          </fieldset>
        </form>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost">
            {t("pages.services.create.createBtn")}
          </Button>
        </DialogClose>
        <Button
          type="submit"
          disabled={disableSubmit}
          loading={isLoading}
          form={formId}
        >
          {!isLoading && <PlusCircle />}
          {t("pages.services.create.createBtn")}
        </Button>
      </DialogFooter>
    </>
  );
};

export default CreateService;