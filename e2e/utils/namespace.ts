import { faker } from "@faker-js/faker";

const apiUrl = process.env.VITE_DEV_API_DOMAIN;

export const mockNamespace = () => `playwright-${faker.git.shortSha()}`;

export const deleteNamespace = (namespace) =>
  new Promise<void>((resolve, reject) => {
    fetch(`${apiUrl}/api/namespaces/${namespace}?recursive=true`, {
      method: "DELETE",
    }).then(() => resolve());
  });
