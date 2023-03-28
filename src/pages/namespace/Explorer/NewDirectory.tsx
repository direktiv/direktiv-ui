import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../design/Dialog";
import { Folder, PlusCircle } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";

import Alert from "../../../design/Alert";
import Button from "../../../design/Button";
import Input from "../../../design/Input";
import { fileNameSchema } from "../../../api/tree/schema";
import { pages } from "../../../util/router/pages";
import { useCreateDirectory } from "../../../api/tree/mutate/createDirectory";
import { useNamespace } from "../../../util/store/namespace";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type FormInput = {
  name: string;
};

const NewDirectory = ({
  path,
  close,
  unallowedNames,
}: {
  path?: string;
  close: () => void;
  unallowedNames: string[];
}) => {
  const namespace = useNamespace();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { isDirty, errors, isValid, isSubmitted },
  } = useForm<FormInput>({
    resolver: zodResolver(
      z.object({
        name: fileNameSchema.and(
          z.string().refine((name) => !unallowedNames.some((n) => n === name), {
            message: "The name already exists",
          })
        ),
      })
    ),
  });

  const { mutate, isLoading } = useCreateDirectory({
    onSuccess: (data) => {
      namespace &&
        navigate(
          pages.explorer.createHref({ namespace, path: data.node.path })
        );
      close();
    },
  });

  const onSubmit: SubmitHandler<FormInput> = ({ name }) => {
    mutate({ path, directory: name });
  };

  // you can not submit if the form has not changed or if there are any errors and
  // you have already submitted the form (errors will first show up after submit)
  const disableSubmit = !isDirty || (isSubmitted && !isValid);

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          <Folder /> Create a new Folder
        </DialogTitle>
      </DialogHeader>

      {!!errors.name && (
        <Alert variant="error" className="mb-5">
          <p>{errors.name.message}</p>
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset className="flex items-center gap-5">
          <label className="w-[90px] text-right text-[15px]" htmlFor="name">
            Name
          </label>
          <Input id="name" placeholder="folder-name" {...register("name")} />
        </fieldset>
      </form>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={disableSubmit} loading={isLoading}>
          {!isLoading && <PlusCircle />}
          Create
        </Button>
      </DialogFooter>
    </>
  );
};

export default NewDirectory;
