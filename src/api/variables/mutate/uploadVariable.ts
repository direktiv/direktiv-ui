import {
  VarUpdatedSchema,
  VarUpdatedSchemaType,
  VarUploadSchemaType,
} from "../schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFactory } from "~/api/apiFactory";
import { useApiKey } from "~/util/store/apiKey";
import { useNamespace } from "~/util/store/namespace";
import { useToast } from "~/design/Toast";
import { useTranslation } from "react-i18next";
import { varKeys } from "..";

export const uploadVar = apiFactory({
  url: ({
    baseUrl,
    namespace,
    name,
  }: {
    baseUrl?: string;
    namespace: string;
    name: string;
  }) => `${baseUrl ?? ""}/api/namespaces/${namespace}/vars/${name}`,
  method: "PUT",
  schema: VarUpdatedSchema,
});

// This mutation has two use cases: creating a variable and updating
// a variable. Both use the same endpoint and verb in the backend API.
export const useUploadVar = ({
  onSuccess,
}: {
  onSuccess?: (data: VarUpdatedSchemaType) => void;
} = {}) => {
  const apiKey = useApiKey();
  const namespace = useNamespace();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  if (!namespace) {
    throw new Error("namespace is undefined");
  }

  const mutationFn = ({
    name,
    formData,
    fileType,
  }: {
    name: string;
    formData: FormData;
    fileType: string;
  }) => {
    debugger;
    return uploadVar({
      apiKey: apiKey ?? undefined,
      payload: formData,
      urlParams: {
        namespace,
        name,
      },
      headers: {
        "content-type": fileType,
      },
    });
  };

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Two cache invalidations are needed due to the current API,
      // which uses the same endpoint for creating and editing.
      // varContent needs a refresh after editing, varList needs a
      // refresh after creating (the variable's content is not
      // included in the list)
      queryClient.invalidateQueries(
        varKeys.varContent(namespace, {
          apiKey: apiKey ?? undefined,
          name: variables.name,
        })
      );
      queryClient.invalidateQueries(
        varKeys.varList(namespace, {
          apiKey: apiKey ?? undefined,
        })
      );
      toast({
        title: t("api.variables.mutate.updateVariable.success.title"),
        description: t(
          "api.variables.mutate.updateVariable.success.description",
          { name: data.key }
        ),
        variant: "success",
      });
      onSuccess?.(data);
    },
    onError: () => {
      toast({
        title: t("api.generic.error"),
        description: t("api.variables.mutate.updateVariable.error.description"),
        variant: "error",
      });
    },
  });
};
