import { createNamespace, deleteNamespace } from "../../utils/namespace";
import { expect, test } from "@playwright/test";
import { jsonSchemaFormWorkflow, jsonSchemaWithRequiredEnum } from "./utils";

import { noop as basicWorkflow } from "~/pages/namespace/Explorer/Tree/NewWorkflow/templates";
import { createWorkflow } from "~/api/tree/mutate/createWorkflow";
import { faker } from "@faker-js/faker";
import { getInput } from "~/api/instances/query/input";
import { headers } from "e2e/utils/testutils";
import { simpleWorkflow } from "e2e/instances/list/utils";

let namespace = "";

test.beforeEach(async () => {
  namespace = await createNamespace();
});

test.afterEach(async () => {
  await deleteNamespace(namespace);
  namespace = "";
});

test("it is possible to open and use the run workflow modal from the editor and the header of the workflow page", async ({
  page,
}) => {
  const workflowName = faker.system.commonFileName("yaml");
  await createWorkflow({
    payload: basicWorkflow.data,
    urlParams: {
      baseUrl: process.env.VITE_DEV_API_DOMAIN,
      namespace,
      name: workflowName,
    },
    headers,
  });

  await page.goto(`${namespace}/explorer/workflow/active/${workflowName}`);

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

  // use the tabs
  expect(
    await page
      .getByTestId("run-workflow-json-tab-btn")
      .getAttribute("aria-selected"),
    "the json tab is selected by default (since this workflow has no JSON schema)"
  ).toBe("true");

  expect(
    await page
      .getByTestId("run-workflow-form-tab-btn")
      .getAttribute("aria-selected")
  ).toBe("false");

  await page.getByTestId("run-workflow-form-tab-btn").click();

  expect(
    await page
      .getByTestId("run-workflow-form-tab-btn")
      .getAttribute("aria-selected"),
    "the form tab is now selected"
  ).toBe("true");

  expect(
    await page
      .getByTestId("run-workflow-json-tab-btn")
      .getAttribute("aria-selected")
  ).toBe("false");

  expect(
    await page.getByTestId("run-workflow-form-input-hint"),
    "it shows a hint that no form could be generated"
  ).toBeVisible();

  await page.getByTestId("run-workflow-cancel-btn").click();
  expect(await page.getByTestId("run-workflow-dialog")).not.toBeVisible();
});

test("it is possible to run the workflow by setting an input JSON via the editor", async ({
  page,
  browserName,
}) => {
  const workflowName = faker.system.commonFileName("yaml");
  await createWorkflow({
    payload: basicWorkflow.data,
    urlParams: {
      baseUrl: process.env.VITE_DEV_API_DOMAIN,
      namespace,
      name: workflowName,
    },
    headers,
  });

  await page.goto(`${namespace}/explorer/workflow/active/${workflowName}`);

  await page.getByTestId("workflow-editor-btn-run").click();
  expect(
    await page.getByTestId("run-workflow-dialog"),
    "it opens the dialog"
  ).toBeVisible();

  expect(
    await page.getByTestId("run-workflow-submit-btn").isEnabled(),
    "the submit button is enabled by default"
  ).toEqual(true);

  await page.type("textarea", "some invalid json");

  expect(
    await page.getByTestId("run-workflow-submit-btn").isEnabled(),
    "submit button is disabled when the json is invalid"
  ).toEqual(false);

  await page.getByTestId("run-workflow-editor").click();
  await page.keyboard.press(browserName === "webkit" ? "Meta+A" : "Control+A");
  await page.keyboard.press("Backspace");
  const userInputString = `{"string": "1", "integer": 1, "boolean": true, "array": [1,2,3], "object": {"key": "value"}}`;
  await page.keyboard.type(userInputString);

  expect(
    await page.getByTestId("run-workflow-submit-btn").isEnabled(),
    "submit is enabled when the json is valid"
  ).toEqual(true);

  // submit to run the workflow
  await page.getByTestId("run-workflow-submit-btn").click();

  const reg = new RegExp(`${namespace}/instances/(.*)`);
  await expect(
    page,
    "workflow was triggered with our input and user was redirected to the instances page"
  ).toHaveURL(reg);
  const instanceId = page.url().match(reg)?.[1];

  if (!instanceId) {
    throw new Error("instanceId not found");
  }

  // check the server state of the input
  const res = await getInput({
    urlParams: {
      baseUrl: process.env.VITE_DEV_API_DOMAIN,
      instanceId,
      namespace,
    },
    headers,
  });

  const inputResponseString = atob(res.data);

  expect(
    inputResponseString,
    "the server result is the same as the input that was sent"
  ).toBe(userInputString);
});

test("it is not possible to run the workflow when the editor has unsaved changes", async ({
  page,
}) => {
  const workflowName = faker.system.commonFileName("yaml");
  await createWorkflow({
    payload: basicWorkflow.data,
    urlParams: {
      baseUrl: process.env.VITE_DEV_API_DOMAIN,
      namespace,
      name: workflowName,
    },
    headers,
  });

  await page.goto(`${namespace}/explorer/workflow/active/${workflowName}`);

  await expect(page.getByTestId("workflow-editor-btn-run")).not.toBeDisabled();

  await page.type("textarea", faker.random.alphaNumeric(9));

  await expect(page.getByTestId("workflow-editor-btn-run")).toBeDisabled();
});

test("it is possible to provide the input via generated form", async ({
  page,
}) => {
  const workflowName = faker.system.commonFileName("yaml");
  await createWorkflow({
    payload: jsonSchemaFormWorkflow,
    urlParams: {
      baseUrl: process.env.VITE_DEV_API_DOMAIN,
      namespace,
      name: workflowName,
    },
    headers,
  });

  await page.goto(`${namespace}/explorer/workflow/active/${workflowName}`);

  await page.getByTestId("workflow-editor-btn-run").click();
  expect(
    await page.getByTestId("run-workflow-dialog"),
    "it opens the dialog"
  ).toBeVisible();

  expect(
    await page
      .getByTestId("run-workflow-form-tab-btn")
      .getAttribute("aria-selected"),
    "it detects the validate step and makes the form tab active by default"
  ).toBe("true");

  // it generated a form (first and last name are required)
  await expect(page.getByLabel("First Name")).toBeVisible();
  await expect(page.getByLabel("Last Name")).toBeVisible();
  await expect(page.getByLabel("Age")).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Select a string" })
  ).toBeVisible();
  await expect(page.getByTestId("json-schema-form-add-button")).toBeVisible();
  await expect(page.getByLabel("Age")).toBeVisible();
  await expect(page.getByLabel("File")).toBeVisible();

  // interact with the select input
  await page.getByRole("combobox", { name: "Select a string" }).click();
  await page.getByRole("option", { name: "Select 2" }).click();

  // interact with the file input
  await page
    .getByLabel("File")
    .setInputFiles("./e2e/utils/fixtures/upload-testfile.txt");

  // interact with the array input
  await page.getByTestId("json-schema-form-add-button").click();
  await page.getByTestId("json-schema-form-add-button").click();
  await page.getByTestId("json-schema-form-add-button").click();
  await page.getByLabel("array-0*").fill("array item 2");
  await page.getByLabel("array-1*").fill("array item 1");
  await page.getByTestId("json-schema-form-down-button-0").click(); // switch 1 and 2
  await page
    .getByLabel("array-2*")
    .fill("this will be deleted in the next step");
  await page.getByTestId("json-schema-form-remove-button-2").click();

  // interact with the number input
  await page.getByLabel("Age").fill("2");

  // submit this form via enter:
  // we have an array form on this page, which also has some buttons
  // using enter here makes sure that we will submit the form and
  // not trigger the buttons from the array form
  await page.keyboard.press("Enter");

  // last name is required and we just tried to send the form without filling it
  await expect(page.getByLabel("First Name")).toBeFocused();
  await page.getByLabel("First Name").fill("Marty");
  await page.getByTestId("run-workflow-submit-btn").click();

  // first name is also required and will now be focused
  await expect(page.getByLabel("Last Name")).toBeFocused();
  await page.getByLabel("Last Name").fill("McFly");
  await page.getByTestId("run-workflow-submit-btn").click();

  const reg = new RegExp(`${namespace}/instances/(.*)`);
  await expect(
    page,
    "workflow was triggered with our input and user was redirected to the instances page"
  ).toHaveURL(reg);
  const instanceId = page.url().match(reg)?.[1];

  if (!instanceId) {
    throw new Error("instanceId not found");
  }

  // check the server state of the input
  const res = await getInput({
    urlParams: {
      baseUrl: process.env.VITE_DEV_API_DOMAIN,
      instanceId,
      namespace,
    },
    headers,
  });

  const expectedJson = {
    age: 2,
    array: ["array item 1", "array item 2"],
    firstName: "Marty",
    lastName: "McFly",
    select: "select 2",
    file: `data:text/plain;base64,SSBhbSBqdXN0IGEgdGVzdGZpbGUgdGhhdCBjYW4gYmUgdXNlZCB0byB0ZXN0IGFuIHVwbG9hZCBmb3JtIHdpdGhpbiBhIHBsYXl3cmlnaHQgdGVzdA==`,
  };
  const inputResponseAsJson = JSON.parse(atob(res.data));
  expect(inputResponseAsJson).toEqual(expectedJson);
});

test("it is possible to provide the input via generated form and resolve form errors", async ({
  page,
}) => {
  const workflowName = faker.system.commonFileName("yaml");
  await createWorkflow({
    payload: jsonSchemaWithRequiredEnum,
    urlParams: {
      baseUrl: process.env.VITE_DEV_API_DOMAIN,
      namespace,
      name: workflowName,
    },
    headers,
  });

  await page.goto(`${namespace}/explorer/workflow/active/${workflowName}`);

  await page.getByTestId("workflow-editor-btn-run").click();
  expect(
    await page.getByTestId("run-workflow-dialog"),
    "it opens the dialog"
  ).toBeVisible();

  expect(
    await page
      .getByTestId("run-workflow-form-tab-btn")
      .getAttribute("aria-selected"),
    "it detects the validate step and makes the form tab active by default"
  ).toBe("true");

  // it generated a form (first and last name are required)
  await expect(page.getByLabel("First Name")).toBeVisible();
  await expect(page.getByLabel("Last Name")).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Select a string" })
  ).toBeVisible();

  //click on submit
  await page.getByTestId("run-workflow-submit-btn").click();

  // last name is required and we just tried to send the form without filling it
  await expect(page.getByLabel("First Name")).toBeFocused();
  await page.getByLabel("First Name").fill("Marty");
  await page.getByTestId("run-workflow-submit-btn").click();

  // first name is also required and will now be focused
  await expect(page.getByLabel("Last Name")).toBeFocused();
  await page.getByLabel("Last Name").fill("McFly");
  await page.getByTestId("run-workflow-submit-btn").click();

  // shows the error to select option
  await expect(
    page.getByTestId("jsonschema-form-error"),
    "an error should be visible"
  ).toBeVisible();

  await expect(
    page.getByTestId("jsonschema-form-error"),
    "error message should be \"must have required property 'select a string'\""
  ).toContainText("must have required property 'select a string'");
  // interact with the select input
  await page.getByRole("combobox", { name: "Select a string" }).click();
  await page.getByRole("option", { name: "Select 2" }).click();
  await page.getByTestId("run-workflow-submit-btn").click();

  const reg = new RegExp(`${namespace}/instances/(.*)`);
  await expect(
    page,
    "workflow was triggered with our input and user was redirected to the instances page"
  ).toHaveURL(reg);
  const instanceId = page.url().match(reg)?.[1];

  if (!instanceId) {
    throw new Error("instanceId not found");
  }

  // check the server state of the input
  const res = await getInput({
    urlParams: {
      baseUrl: process.env.VITE_DEV_API_DOMAIN,
      instanceId,
      namespace,
    },
    headers,
  });

  const expectedJson = {
    firstName: "Marty",
    lastName: "McFly",
    select: "select 2",
  };
  const inputResponseAsJson = JSON.parse(atob(res.data));
  expect(inputResponseAsJson).toEqual(expectedJson);
});

test("it is possible to test the API Commands button", async ({ page }) => {
  function cleanString(input: string): string {
    // Remove whitespace and special characters
    return input.replace(/\s+/g, "").replace(/[^\w\s]/gi, "");
  }

  function assertStringContainsYAMLPayload(
    strA: string,
    yamlPayload: string
  ): boolean {
    const cleanedA = cleanString(strA);
    const cleanedYAML = cleanString(yamlPayload);
    return cleanedA.includes(cleanedYAML);
  }

  const workflowName = faker.system.commonFileName("yaml");
  await createWorkflow({
    payload: simpleWorkflow,
    urlParams: {
      baseUrl: process.env.VITE_DEV_API_DOMAIN,
      namespace,
      name: workflowName,
    },
    headers,
  });

  await page.goto(`${namespace}/explorer/workflow/active/${workflowName}`);
  await page.getByTestId("trigger-api-commands").click();
  await expect(
    page.getByTestId("api-commands-wrapper"),
    "api commands dialog should be opened"
  ).toBeVisible();

  //shows current namespace
  const namespaceInput = page.getByTestId("api-commands-namespace-name");
  const namespaceInputValue = await namespaceInput.inputValue();
  expect(namespaceInputValue, "name should be the current namespace").toBe(
    namespace
  );

  //it shows the current workflow name
  const workflowInput = page.getByTestId("api-commands-workflow-name");
  const workflowInputValue = await workflowInput.inputValue();
  expect(workflowInputValue, "it shows the current workflow name").toBe(
    workflowName
  );

  //"Execute workflow" is the default Interaction selected
  await expect(
    page.getByTestId("api-commands-interaction-trigger"),
    "Execute workflow is the default Interaction selected"
  ).toContainText("Execute workflow");

  //it shows the http method
  await expect(
    page.getByTestId("api-commands-method-badge"),
    "it shows the http method"
  ).toBeVisible();

  //it shows the endpoint url
  const defaultOp = "execute";
  const endpointUrl = `http://localhost:3333/api/namespaces/${namespace}/tree/${workflowName}?op=${defaultOp}`;
  await expect(
    page.getByTestId("api-commands-endpoint-url"),
    "it shows the endpoint url"
  ).toContainText(endpointUrl);

  const jsonPayload = `{
  "some": "input"
}`;
  const yamlPayload = `description: A simple 'no-op' state that returns 'Hello world!'
states:
- id: helloworld
  type: noop
  transform:
    result: Hello world!`;
  //it shows the payload
  const textArea = page
    .getByTestId("api-commands-payload-wrap")
    .getByRole("textbox");
  await expect
    .poll(async () => await textArea.inputValue(), "it shows the payload")
    .toBe(jsonPayload);

  //the copy button copies the fetch command, depending on users input (this could be tested directly inside various other test above)
  await page.getByTestId("api-commands-copy-as-curl").click({ force: true });
  let clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  let clipboardHasAllPayload = assertStringContainsYAMLPayload(
    clipboardText,
    jsonPayload
  );
  expect(
    clipboardHasAllPayload,
    "clipboard text should contain the payload"
  ).toBe(true);
  expect(
    clipboardText,
    "clipboard text should contain the endpoint url"
  ).toContain(endpointUrl);

  //updating the namespace changes the endpoint url
  const updatedNamespace = faker.system.fileName();
  await namespaceInput.fill(updatedNamespace);
  let updatedEndpointUrl = `http://localhost:3333/api/namespaces/${updatedNamespace}/tree/${workflowName}?op=${defaultOp}`;
  await expect(
    page.getByTestId("api-commands-endpoint-url"),
    "it shows the updated endpoint url"
  ).toContainText(updatedEndpointUrl);

  //updating the workflow changes the endpoint url
  const updatedWorkflow = faker.system.commonFileName("yaml");
  await workflowInput.fill(updatedWorkflow);
  updatedEndpointUrl = `http://localhost:3333/api/namespaces/${updatedNamespace}/tree/${updatedWorkflow}?op=${defaultOp}`;
  await expect(
    page.getByTestId("api-commands-endpoint-url"),
    "it shows the updated endpoint url"
  ).toContainText(updatedEndpointUrl);

  //updating the interaction to Execute workflow and wait, updates the url
  await page.getByTestId("api-commands-interaction-trigger").click();
  await page.getByTestId("api-commands-interaction-awaitExecute").click();
  updatedEndpointUrl = `http://localhost:3333/api/namespaces/${updatedNamespace}/tree/${updatedWorkflow}?op=wait`;
  await expect(
    page.getByTestId("api-commands-endpoint-url"),
    "updating the interaction to Execute workflow and wait, updates the url"
  ).toContainText(updatedEndpointUrl);

  //updating the interaction to "Update a workflow", updates the url and the payload, payload it now in yaml syntax highlight mode
  await page.getByTestId("api-commands-interaction-trigger").click();
  await page.getByTestId("api-commands-interaction-update").click();
  updatedEndpointUrl = `http://localhost:3333/api/namespaces/${updatedNamespace}/tree/${updatedWorkflow}?op=update-workflow`;
  await expect(
    page.getByTestId("api-commands-endpoint-url"),
    "updating the interaction to Execute workflow and wait, updates the url"
  ).toContainText(updatedEndpointUrl);

  await expect
    .poll(
      async () => await textArea.inputValue(),
      " payload it now in yaml syntax highlight mode"
    )
    .toBe(yamlPayload);

  //the copy button copies the fetch command, depending on users input (this could be tested directly inside various other test above)
  await page.getByTestId("api-commands-copy-as-curl").click({ force: true });
  clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  clipboardHasAllPayload = assertStringContainsYAMLPayload(
    clipboardText,
    yamlPayload
  );
  expect(
    clipboardHasAllPayload,
    "clipboard text should contain the payload"
  ).toBe(true);
  expect(
    clipboardText,
    "clipboard text should contain the endpoint url"
  ).toContain(updatedEndpointUrl);
});
