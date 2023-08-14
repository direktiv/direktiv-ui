import { ServiceCreatedSchema, ServiceFormSchemaType } from "../schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFactory } from "~/api/apiFactory";
import { serviceKeys } from "..";
import { useApiKey } from "~/util/store/apiKey";
import { useNamespace } from "~/util/store/namespace";
import { useToast } from "~/design/Toast";
import { useTranslation } from "react-i18next";

const createService = apiFactory({
  url: ({ name }: { name: string; service: ServiceFormSchemaType }) =>
    `/api/functions/namespaces/${name}`,
  method: "PUT",
  schema: ServiceCreatedSchema,
});

type ResolvedCreateNamespace = Awaited<ReturnType<typeof createService>>;

export const useCreateService = ({
  onSuccess,
}: { onSuccess?: (data: ResolvedCreateNamespace) => void } = {}) => {
  const apiKey = useApiKey();
  const namespace = useNamespace();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  if (!namespace) {
    throw new Error("namespace is undefined");
  }

  return useMutation({
    mutationFn: ({
      name,
      service,
    }: {
      name: string;
      service: ServiceFormSchemaType;
    }) =>
      createService({
        apiKey: apiKey ?? undefined,
        urlParams: {
          name,
          service,
        },
        payload: service,
      }),
    onSuccess(data, variables) {
      queryClient.invalidateQueries(
        serviceKeys.servicesList(namespace, {
          apiKey: apiKey ?? undefined,
        })
      );
      toast({
        title: t("api.services.mutate.createService.success.title"),
        description: t(
          "api.services.mutate.createService.success.description",
          { name: variables.name }
        ),
        variant: "success",
      });
      onSuccess?.(data);
    },
    onError: () => {
      toast({
        title: t("api.generic.error"),
        description: t("api.services.mutate.createService.error.description"),
        variant: "error",
      });
    },
  });
};
