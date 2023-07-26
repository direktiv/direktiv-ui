import { cleanupNamespaces } from "./utils/namespace";
import { faker } from "@faker-js/faker";

const globalSetup = () => {
  const testRunId = faker.git.shortSha();
  process.env.TEST_RUN_ID = testRunId;

  return async () => {
    if (!testRunId) {
      throw new Error("process.env.TEST_RUN_ID is not defined");
    }
    await cleanupNamespaces(testRunId);
  };
};

export default globalSetup;
