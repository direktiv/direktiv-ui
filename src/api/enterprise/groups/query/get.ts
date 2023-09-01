import { QueryFunctionContext, useQuery } from "@tanstack/react-query";

import { GroupsListSchema } from "../schema";
import { apiFactory } from "~/api/apiFactory";
import { faker } from "@faker-js/faker";
import { groupKeys } from "..";
import { useApiKey } from "~/util/store/apiKey";
import { useNamespace } from "~/util/store/namespace";
import { z } from "zod";

// TODO: remove the line below and delete the mock function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getGroups = apiFactory({
  url: ({ namespace, baseUrl }: { baseUrl?: string; namespace: string }) =>
    `${baseUrl ?? ""}/api/v2/namespaces/${namespace}/groups`,
  method: "GET",
  schema: GroupsListSchema,
});

const getGroupsMock = (_params: {
  apiKey?: string;
  urlParams: { namespace: string };
}): Promise<z.infer<typeof GroupsListSchema>> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        groups: [
          {
            id: faker.datatype.uuid(),
            group: faker.word.adjective(),
            description: faker.lorem.sentence(),
            permissions: ["workflowView", "permissionsView"],
          },
          {
            id: faker.datatype.uuid(),
            group: faker.word.adjective(),
            description: faker.lorem.sentence(),
            permissions: ["workflowView", "permissionsView"],
          },
          {
            id: faker.datatype.uuid(),
            group: faker.word.adjective(),
            description: faker.lorem.sentence(),
            permissions: ["workflowView", "permissionsView"],
          },
        ],
      });
    }, 500);
  });

const fetchGroups = async ({
  queryKey: [{ apiKey, namespace }],
}: QueryFunctionContext<ReturnType<(typeof groupKeys)["groupList"]>>) =>
  getGroupsMock({
    apiKey,
    urlParams: { namespace },
  });

export const useGroups = () => {
  const apiKey = useApiKey();
  const namespace = useNamespace();

  if (!namespace) {
    throw new Error("namespace is undefined");
  }

  return useQuery({
    queryKey: groupKeys.groupList(namespace, {
      apiKey: apiKey ?? undefined,
    }),
    queryFn: fetchGroups,
    enabled: !!namespace,
  });
};
