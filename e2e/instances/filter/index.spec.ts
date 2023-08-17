import { createNamespace, deleteNamespace } from "../../utils/namespace";
import { expect, test } from "@playwright/test";
import {
  parentWorkflow as parentWorkflowContent,
  simpleWorkflow as simpleWorkflowContent,
  workflowThatFails as workflowThatFailsContent,
} from "./utils";

import { createWorkflow } from "~/api/tree/mutate/createWorkflow";
import { faker } from "@faker-js/faker";
import { headers } from "e2e/utils/testutils";
import { runWorkflow } from "~/api/tree/mutate/runWorkflow";

let namespace = "";
const simpleWorkflow = faker.system.commonFileName("yaml");
const workflowThatFails = faker.system.commonFileName("yaml");

test.beforeEach(async () => {
  namespace = await createNamespace();
  // place some workflows in the namespace that we can use to create instances
  await createWorkflow({
    payload: simpleWorkflowContent,
    urlParams: {
      baseUrl: process.env.VITE_DEV_API_DOMAIN,
      namespace,
      name: simpleWorkflow,
    },
    headers,
  });

  await createWorkflow({
    payload: workflowThatFailsContent,
    urlParams: {
      baseUrl: process.env.VITE_DEV_API_DOMAIN,
      namespace,
      name: workflowThatFails,
    },
    headers,
  });
});

test.afterEach(async () => {
  await deleteNamespace(namespace);
  namespace = "";
});

const createBasicInstance = async () =>
  await runWorkflow({
    urlParams: {
      baseUrl: process.env.VITE_DEV_API_DOMAIN,
      namespace,
      path: simpleWorkflow,
    },
    headers,
  });

const createFailedInstance = async () =>
  await runWorkflow({
    urlParams: {
      baseUrl: process.env.VITE_DEV_API_DOMAIN,
      namespace,
      path: workflowThatFails,
    },
    headers,
  });

const createNameFilterInstances = async () => {
  //creates workflows with the following names, 4 instances with different name
  const names = ["workflow1", "workflow2", "workflow3", "test1"];
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    await createWorkflow({
      payload: simpleWorkflowContent,
      urlParams: {
        baseUrl: process.env.VITE_DEV_API_DOMAIN,
        namespace,
        name: name + ".yaml",
      },
      headers,
    });
    await runWorkflow({
      urlParams: {
        baseUrl: process.env.VITE_DEV_API_DOMAIN,
        namespace,
        path: name + ".yaml",
      },
      headers,
    });
  }
};

const createStatusFilterInstances = async () => {
  //create 3 Failed instances
  await createFailedInstance();
  await createFailedInstance();
  await createFailedInstance();
  //create 2 complete instances
  await createBasicInstance();
  await createBasicInstance();
};

const createTriggerFilterInstances = async () => {
  // create 1 trigger "api" instances and 2 instance with trigger "instance"
  const parentWorkflow = faker.system.commonFileName("yaml");

  await createWorkflow({
    payload: parentWorkflowContent({
      childName: simpleWorkflow,
      children: 2,
    }),
    urlParams: {
      baseUrl: process.env.VITE_DEV_API_DOMAIN,
      namespace,
      name: parentWorkflow,
    },
    headers,
  });

  await runWorkflow({
    urlParams: {
      baseUrl: process.env.VITE_DEV_API_DOMAIN,
      namespace,
      path: parentWorkflow,
    },
    headers,
  });
};

const createDateFilterInstances = async () => {
  //create 2 basic instances
  await createBasicInstance();
  await createBasicInstance();
};

const createMultipleFilterInstances = async () => {
  await createNameFilterInstances();
  await createStatusFilterInstances();
  await createTriggerFilterInstances();
};

const createPaginationFilterInstances = async () => {
  const parentWorkflow = faker.system.commonFileName("yaml");
  await createWorkflow({
    payload: parentWorkflowContent({
      childName: simpleWorkflow,
      children: 35,
    }),
    urlParams: {
      baseUrl: process.env.VITE_DEV_API_DOMAIN,
      namespace,
      name: parentWorkflow,
    },
    headers,
  });

  await runWorkflow({
    urlParams: {
      baseUrl: process.env.VITE_DEV_API_DOMAIN,
      namespace,
      path: parentWorkflow,
    },
    headers,
  });
};
test("it is possible to filter by date using createdAfter.", async ({
  page,
}) => {
  await createDateFilterInstances();
  await page.goto(`${namespace}/instances/`);

  // there should be 2 items initially
  const rows = page.getByTestId(/instance-row-workflow/);
  await expect(rows, "there should be 2 instances").toHaveCount(2);

  //filter createdAfter now should return 0 results
  const btnPlus = page.getByTestId("filter-plus-button");
  await btnPlus.click();

  await page.getByTestId("filter-field-AFTER").click();
  const date = new Date().getDate();

  await page.getByText(date.toString(), { exact: true }).click();
  await expect(
    rows,
    "there should be 0 rows when we filter after today"
  ).toHaveCount(0);

  //close the date filter
  await page.getByTestId("filter-date-close-btn").click();
  await expect(
    rows,
    "there should be 2 rows when we close the filter"
  ).toHaveCount(2);

  //
  await btnPlus.click();
  await page.getByTestId("filter-field-BEFORE").click();
  if (date < 28) {
    await page.getByText((date + 1).toString(), { exact: true }).click();
    await expect(
      rows,
      "there should be 2 rows when we filter before tomorrow"
    ).toHaveCount(2);
  } else {
    await page.getByText(date.toString(), { exact: true }).click();
    await expect(
      rows,
      "there should be 0 rows when we filter before today"
    ).toHaveCount(0);
  }
});

test("it is possible to filter by trigger.", async ({ page }) => {
  await createTriggerFilterInstances();
  await page.goto(`${namespace}/instances/`);

  // there should be 3 items initially
  const rows = page.getByTestId(/instance-row-workflow/);
  await expect(rows, "there should be 3 rows").toHaveCount(3);

  const btnPlus = page.getByTestId("filter-plus-button");
  await btnPlus.click();
  await page.getByTestId("filter-field-TRIGGER").click();

  await page.getByTestId("filter-sub-options-instance").click();
  await expect(
    rows,
    "there should be 2 rows with filter trigger: instance"
  ).toHaveCount(2);

  //click on value and reset to api, should be 1 trigger instance
  await page.getByTestId("filter-status-trigger-value-trg").click();
  await page.getByTestId("filter-sub-options-api").click();
  await expect(
    rows,
    "there should be 1 rows with filter trigger: api"
  ).toHaveCount(1);

  //when close the filter it should show 3 instances again
  await page.getByTestId("filter-status-trigger-close-btn").click();
  await expect(
    rows,
    "there should be 3 rows when we cancel the filter"
  ).toHaveCount(3);
});

test("it is possible to filter by status.", async ({ page }) => {
  await createStatusFilterInstances();
  await page.goto(`${namespace}/instances/`);

  // there should be 5 items initially
  const rows = page.getByTestId(/instance-row-workflow/);
  await expect(rows, "there should be 5 rows").toHaveCount(5);

  const btnPlus = page.getByTestId("filter-plus-button");
  await btnPlus.click();
  await page.getByTestId("filter-field-STATUS").click();

  //filter by completed status will show 2
  await page.getByTestId("filter-sub-options-complete").click();
  await expect(
    rows,
    "there should be 2 rows with filter status: complete"
  ).toHaveCount(2);

  //click on value and reset to failed, should be 3 failed instances
  await page.getByTestId("filter-status-trigger-value-trg").click();
  await page.getByTestId("filter-sub-options-failed").click();
  await expect(
    rows,
    "there should be 3 rows with filter status: failed"
  ).toHaveCount(3);

  //when close the filter it should show 5 instances again
  await page.getByTestId("filter-status-trigger-close-btn").click();
  await expect(
    rows,
    "there should be 5 rows when we cancel the filter"
  ).toHaveCount(5);
});
test("it is possible to filter by name.", async ({ page }) => {
  await createNameFilterInstances();
  await page.goto(`${namespace}/instances/`);

  // there should be 4 items initially
  const rows = page.getByTestId(/instance-row-workflow/);
  await expect(rows, "there should be 4 rows").toHaveCount(4);

  const btnPlus = page.getByTestId("filter-plus-button");
  await btnPlus.click();
  await page.getByTestId("filter-field-AS").click();

  await page.getByTestId("filter-field-as-input").type("workflow");
  await page.keyboard.press("Enter");

  //filter by name: workflow, result should be 3
  await expect(
    rows,
    "there should be 3 rows with filter name: workflow"
  ).toHaveCount(3);

  // //change the filter to test, result should be 1
  await page.getByTestId("filter-name-value-trg-btn").click();
  await page.getByTestId("filter-field-as-input").fill("test");
  await page.keyboard.press("Enter");
  await expect(
    rows,
    "there should be 1 rows with filter name: test"
  ).toHaveCount(1);

  //after clicking close, there should be 4 again
  await page.getByTestId("filter-name-close-btn").click();
  await expect(
    rows,
    "there should be 4 rows when cancel the filter"
  ).toHaveCount(4);
});

test("it is possible to apply multiple filters", async ({ page }) => {
  await createMultipleFilterInstances(); //create 12 instances
  await page.goto(`${namespace}/instances/`);

  // there should be 12 items initially
  // 2 trigger: instance
  // 10: trigger: api
  // 3: has name workflow
  // 3: failed status
  // combined filters
  // has name workflow and trigger "api" => 3
  // has name workflow trigger: "instance" => 0

  const rows = page.getByTestId(/instance-row-workflow/);
  await expect(rows, "there should be 12 instances").toHaveCount(12);
  const btnPlus = page.getByTestId("filter-plus-button");
  await btnPlus.click();
  await page.getByTestId("filter-field-AS").click();
  await page.getByTestId("filter-field-as-input").type("workflow");
  await page.keyboard.press("Enter");

  // there should be 3 instances with name workflow
  await expect(
    rows,
    "there should be 3 instances with name workflow"
  ).toHaveCount(3);

  // add filter by trigger instance which should result 0
  await btnPlus.click();
  await page.getByTestId("filter-field-TRIGGER").click();
  await page.getByTestId("filter-sub-options-instance").click();
  await expect(
    rows,
    "there should be 0 rows with filter trigger: instance & name: workflow"
  ).toHaveCount(0);

  // cancel all filters, test status == failed & before tomorrow , to result 3
  await page.getByTestId("filter-status-trigger-close-btn").click();
  await page.getByTestId("filter-name-close-btn").click();

  await btnPlus.click();
  await page.getByTestId("filter-field-STATUS").click();
  await page.getByTestId("filter-sub-options-failed").click();
  await expect(
    rows,
    "there should be 3 rows with filter status: failed"
  ).toHaveCount(3);
  await btnPlus.click();

  const date = new Date().getDate();
  await page.getByTestId("filter-field-BEFORE").click();
  if (date < 28) {
    await page.getByText((date + 1).toString(), { exact: true }).click();
    await expect(
      rows,
      "there should be 3 rows when we filter before tomorrow"
    ).toHaveCount(3);
  } else {
    await page.getByText(date.toString(), { exact: true }).click();
    await expect(
      rows,
      "there should be 0 rows when we filter before today"
    ).toHaveCount(0);
  }
});

test("it should go to page 1 when apply filter", async ({ page }) => {
  await createPaginationFilterInstances(); //created 36 instances
  await page.goto(`${namespace}/instances/`);

  //go to page 2, apply filter, check if page is back to 1
  const btnNext = page.getByTestId("pagination-btn-right");
  const page1Btn = page.getByTestId(`pagination-btn-page-1`);
  const page2Btn = page.getByTestId(`pagination-btn-page-2`);

  await btnNext.click();
  await expect(
    page2Btn,
    "active button with the page number should have an aria-current attribute with a value of page"
  ).toHaveAttribute("aria-current", "page");

  const btnPlus = page.getByTestId("filter-plus-button");
  await btnPlus.click();
  await page.getByTestId("filter-field-TRIGGER").click();
  await page.getByTestId("filter-sub-options-instance").click();
  await expect(
    page1Btn,
    "active button with the page number should have an aria-current attribute with a value of page"
  ).toHaveAttribute("aria-current", "page");
});
