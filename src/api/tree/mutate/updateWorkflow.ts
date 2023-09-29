import { NodeListSchemaType, WorkflowCreatedSchema } from "../schema/node";

import { apiFactory } from "~/api/apiFactory";
import { forceLeadingSlash } from "../utils";
import { getMessageFromApiError } from "~/api/errorHandling";
import { treeKeys } from "..";
import { useApiKey } from "~/util/store/apiKey";
import useMutationWithPermissions from "~/api/useMutationWithPermissions";
import { useNamespace } from "~/util/store/namespace";
import { useQueryClient } from "@tanstack/react-query";

export const updateWorkflow = apiFactory({
  url: ({
    baseUrl,
    namespace,
    path,
  }: {
    baseUrl?: string;
    namespace: string;
    path?: string;
  }) =>
    `${baseUrl ?? ""}/api/namespaces/${namespace}/tree${forceLeadingSlash(
      path
    )}?op=update-workflow`,
  method: "POST",
  schema: WorkflowCreatedSchema,
});

export const useUpdateWorkflow = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (e: string | undefined) => void;
} = {}) => {
  const apiKey = useApiKey();
  const namespace = useNamespace();
  const queryClient = useQueryClient();

  if (!namespace) {
    throw new Error("namespace is undefined");
  }

  return useMutationWithPermissions({
    mutationFn: ({
      path,
      fileContent,
    }: {
      path: string;
      fileContent: string;
    }) =>
      updateWorkflow({
        apiKey: apiKey ?? undefined,
        payload: fileContent,
        urlParams: {
          namespace,
          path,
        },
      }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData<NodeListSchemaType>(
        treeKeys.nodeContent(namespace, {
          apiKey: apiKey ?? undefined,
          path: variables.path,
        }),
        () => data
      );
      onSuccess?.();
    },
    onError: (e) => {
      onError?.(getMessageFromApiError(e));
    },
  });
};
