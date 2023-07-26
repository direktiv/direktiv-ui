import { NamespaceListSchemaType } from "~/api/namespaces/schema";
import { faker } from "@faker-js/faker";

const apiUrl = process.env.VITE_DEV_API_DOMAIN;
const testRunId = process.env.TEST_RUN_ID;

export const createNamespaceName = () =>
  `pw-${testRunId}-${faker.git.shortSha()}`;

export const createNamespace = () =>
  new Promise<string>((resolve, reject) => {
    const name = createNamespaceName();
    fetch(`${apiUrl}/api/namespaces/${name}`, {
      method: "PUT",
    }).then((response) => {
      response.ok
        ? resolve(name)
        : reject(`creating namespace failed with code ${response.status}`);
    });
  });

// not currently used, rely on cleanupNamespaces during global teardown instead
// export const deleteNamespace = (namespace: string) =>
//   new Promise<void>((resolve, reject) => {
//     fetch(`${apiUrl}/api/namespaces/${namespace}?recursive=true`, {
//       method: "DELETE",
//     }).then((response) => {
//       response.ok
//         ? resolve()
//         : reject(`deleting namespace failed with code ${response.status}`);
//     });
//   });

export const checkIfNamespaceExists = async (namespace: string) => {
  const response = await fetch(`${apiUrl}/api/namespaces`);
  if (!response.ok) {
    throw `fetching namespaces failed with code ${response.status}`;
  }
  const namespaceInResponse = await response
    .json()
    .then((json: NamespaceListSchemaType) =>
      json.results.find((ns) => ns.name === namespace)
    );
  return !!namespaceInResponse;
};

// This is used in global teardown to delete all namespaces created during
// the current test run. This avoids a negative impact of the server load
// caused by deleting namespaces on consecutive tests.
export const cleanupNamespaces = async (testRunId: string) => {
  const response = await fetch(`${apiUrl}/api/namespaces`);
  const namespaces = await response
    .json()
    .then((json: NamespaceListSchemaType) =>
      json.results.filter((ns) => ns.name.includes(`pw-${testRunId}`))
    );
  const requests = namespaces.map((ns) =>
    fetch(`${apiUrl}/api/namespaces/${ns.name}?recursive=true`, {
      method: "DELETE",
    })
  );

  return await Promise.all(requests);
};
