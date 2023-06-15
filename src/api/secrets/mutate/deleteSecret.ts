import {
  SecretDeletedSchema,
  SecretListSchemaType,
  SecretSchemaType,
} from "../schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFactory } from "../../utils";
import { secretKeys } from "..";
import { useApiKey } from "../../../util/store/apiKey";
import { useNamespace } from "../../../util/store/namespace";
import { useToast } from "../../../design/Toast";

const updateCache = (
  oldData: SecretListSchemaType | undefined,
  deletedItem: SecretSchemaType
) => {
  if (!oldData) return undefined;
  const oldSecrets = oldData.secrets.results;

  return {
    ...oldData,
    ...(oldSecrets
      ? {
          secrets: {
            results: oldSecrets.filter(
              (item: SecretSchemaType) => item.name !== deletedItem.name
            ),
          },
        }
      : {}),
  };
};

const deleteSecret = apiFactory({
  url: ({ namespace, name }: { namespace: string; name: string }) =>
    `/api/namespaces/${namespace}/secrets/${name}`,
  method: "DELETE",
  schema: SecretDeletedSchema,
});

export const useDeleteSecret = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const apiKey = useApiKey();
  const namespace = useNamespace();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!namespace) {
    throw new Error("namespace is undefined");
  }

  return useMutation({
    mutationFn: ({ secret }: { secret: SecretSchemaType }) =>
      deleteSecret({
        apiKey: apiKey ?? undefined,
        payload: undefined,
        urlParams: {
          name: secret.name,
          namespace: namespace,
        },
        headers: undefined,
      }),
    onSuccess(_, variables) {
      const deletedItem = variables.secret;
      queryClient.setQueryData<SecretListSchemaType>(
        secretKeys.secretsList(namespace, {
          apiKey: apiKey ?? undefined,
        }),
        (oldData) => updateCache(oldData, deletedItem)
      );
      toast({
        title: "Secret deleted",
        description: `Secret ${variables.secret.name} was deleted`,
        variant: "success",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "An error occurred",
        description: "Could not delete secret 😢",
        variant: "error",
      });
    },
  });
};
