import { createNamespace, deleteNamespace } from "../../utils/namespace";
import { expect, test } from "@playwright/test";

import { createWorkflow } from "../../utils/node";
import { faker } from "@faker-js/faker";

let namespace = "";
let workflow = "";

test.beforeEach(async () => {
  namespace = await createNamespace();
  workflow = await createWorkflow(namespace, faker.git.shortSha() + ".yaml");
});

test.afterEach(async () => {
  await deleteNamespace(namespace);
  namespace = "";
});

test("it is possible top open the run workflow modal from the editor and the header of the workflow page", async ({
  page,
}) => {
  await page.goto(`${namespace}/explorer/workflow/active/${workflow}`);

  // open modal via editor button
  await page.getByTestId("workflow-editor-btn-run").click();
  expect(
    await page.getByTestId("run-workflow-dialog"),
    "it opens the dialog from the editor button"
  ).toBeVisible();
  await page.getByTestId("run-workflow-cancel-btn").click();
  expect(await page.getByTestId("run-workflow-dialog")).not.toBeVisible();

  // open modal via header button
  await page.getByTestId("workflow-header-btn-run").click();
  expect(
    await page.getByTestId("run-workflow-dialog"),
    "it opens the dialog from the header button"
  ).toBeVisible();
  await page.getByTestId("run-workflow-cancel-btn").click();
  expect(await page.getByTestId("run-workflow-dialog")).not.toBeVisible();
});

test("it is possible to run the workflow by setting an input JSON via tha editor", async ({
  page,
}) => {
  await page.goto(`${namespace}/explorer/workflow/active/${workflow}`);

  // open modal via editor button
  await page.getByTestId("workflow-editor-btn-run").click();
  expect(
    await page.getByTestId("run-workflow-dialog"),
    "it opens the dialog"
  ).toBeVisible();

  // url should be
  await expect(page).toHaveURL(new RegExp(`${namespace}/instances/`));
});
