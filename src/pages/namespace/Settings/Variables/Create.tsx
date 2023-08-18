import { ChangeEvent, useState } from "react";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/design/Dialog";
import Editor, { EditorLanguagesType } from "~/design/Editor";
import MimeTypeSelect, {
  MimeTypeType,
  mimeTypeToLanguageDict,
} from "./MimeTypeSelect";
import { SubmitHandler, useForm } from "react-hook-form";
import { Tabs, TabsList, TabsTrigger } from "~/design/Tabs";
import {
  VarFormSchema,
  VarFormSchemaType,
  VarUploadSchema,
  VarUploadSchemaType,
} from "~/api/variables/schema";

import Button from "~/design/Button";
import { Card } from "~/design/Card";
import FormErrors from "~/componentsNext/FormErrors";
import Input from "~/design/Input";
import { PlusCircle } from "lucide-react";
import { useTheme } from "~/util/store/theme";
import { useTranslation } from "react-i18next";
import { useUpdateVar } from "~/api/variables/mutate/updateVariable";
import { useUploadVar } from "~/api/variables/mutate/uploadVariable";
import { zodResolver } from "@hookform/resolvers/zod";

type CreateProps = { onSuccess: () => void };

const defaultMimeType: MimeTypeType = "application/json";

const Create = ({ onSuccess }: CreateProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [name, setName] = useState<string | undefined>();
  const [body, setBody] = useState<string | undefined>();
  const [isFile, setIsFile] = useState(false);
  const [file, setFile] = useState<File | undefined>();
  const [mimeType, setMimeType] = useState<MimeTypeType>(defaultMimeType);
  const [editorLanguage, setEditorLanguage] = useState<EditorLanguagesType>(
    mimeTypeToLanguageDict[defaultMimeType]
  );

  const {
    handleSubmit: formSubmit,
    formState: { errors: formErrors },
  } = useForm<VarFormSchemaType>({
    resolver: zodResolver(VarFormSchema),
    // mimeType should always be initialized to avoid backend defaulting to
    // "text/plain, charset=utf-8", which does not fit the options in
    // MimeTypeSelect
    values: {
      name: name ?? "",
      content: body ?? "",
      mimeType: mimeType ?? defaultMimeType,
    },
  });

  const {
    handleSubmit: fileSubmit,
    formState: { errors: fileErrors },
  } = useForm<VarUploadSchemaType>({
    resolver: zodResolver(VarUploadSchema),
    values: {
      name: name ?? "",
      file,
    },
  });

  const onMimetypeChange = (value: MimeTypeType) => {
    setMimeType(value);
    setEditorLanguage(mimeTypeToLanguageDict[value]);
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFile(file);
  };

  const { mutate: createVarMutation } = useUpdateVar({
    onSuccess,
  });

  const { mutate: uploadVarMutation } = useUploadVar({
    onSuccess,
  });

  const onFormSubmit: SubmitHandler<VarFormSchemaType> = (data) => {
    createVarMutation(data);
  };

  const onFileSubmit: SubmitHandler<VarUploadSchemaType> = (data) => {
    const formData = new FormData();
    formData.append("file", data.file);
    uploadVarMutation({ name: data.name, formData, fileType: data.file.type });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogHeader>
          <DialogTitle>
            <PlusCircle />
            {t("pages.settings.variables.create.title")}
          </DialogTitle>
        </DialogHeader>
      </DialogHeader>

      <Tabs className="mt-2 sm:w-[400px]" defaultValue="form">
        <TabsList variant="boxed">
          <TabsTrigger
            variant="boxed"
            value="form"
            onClick={() => setIsFile(false)}
          >
            Edit
          </TabsTrigger>
          <TabsTrigger
            variant="boxed"
            value="file"
            onClick={() => setIsFile(true)}
          >
            Upload File
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isFile ? (
        <form
          id="upload-variable"
          onSubmit={fileSubmit(onFileSubmit)}
          className="flex flex-col space-y-5"
        >
          <FormErrors errors={fileErrors} className="mb-5" />

          <fieldset className="flex items-center gap-5">
            <label className="w-[150px] text-right" htmlFor="name">
              {t("pages.settings.variables.create.name")}
            </label>
            <Input
              id="name"
              data-testid="new-variable-name"
              placeholder="variable-name"
              onChange={(event) => setName(event.target.value)}
            />
          </fieldset>

          <Input type="file" onChange={onFileChange} />

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">
                {t("components.button.label.cancel")}
              </Button>
            </DialogClose>
            <Button data-testid="variable-create-submit" type="submit">
              {t("components.button.label.create")}
            </Button>
          </DialogFooter>
        </form>
      ) : (
        <form
          id="create-variable"
          onSubmit={formSubmit(onFormSubmit)}
          className="flex flex-col space-y-5"
        >
          <FormErrors errors={formErrors} className="mb-5" />

          <fieldset className="flex items-center gap-5">
            <label className="w-[150px] text-right" htmlFor="name">
              {t("pages.settings.variables.create.name")}
            </label>
            <Input
              id="name"
              data-testid="new-variable-name"
              placeholder="variable-name"
              onChange={(event) => setName(event.target.value)}
            />
          </fieldset>

          <fieldset className="flex items-center gap-5">
            <label className="w-[150px] text-right" htmlFor="mimetype">
              {t("pages.settings.variables.edit.mimeType.label")}
            </label>
            <MimeTypeSelect
              id="mimetype"
              mimeType={mimeType}
              onChange={onMimetypeChange}
            />
          </fieldset>

          <Card
            className="grow p-4 pl-0"
            background="weight-1"
            data-testid="variable-create-card"
          >
            <div className="h-[500px]">
              <Editor
                value={body}
                onChange={(newData) => {
                  setBody(newData);
                }}
                theme={theme ?? undefined}
                data-testid="variable-editor"
                language={editorLanguage}
              />
            </div>
          </Card>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">
                {t("components.button.label.cancel")}
              </Button>
            </DialogClose>
            <Button data-testid="variable-create-submit" type="submit">
              {t("components.button.label.create")}
            </Button>
          </DialogFooter>
        </form>
      )}
    </DialogContent>
  );
};

export default Create;
