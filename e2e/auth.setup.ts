import { test as setup } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.

  await page.goto("/");
  await page.getByTestId("api-key-input").fill("Qhxw6U3#6&hu^j");
  await page.getByTestId("api-key-set-btn").click();
  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  // await page.waitForURL(/http:\/\/localhost:3333\/[^\/]+\/explorer\/tree/);
  // Alternatively, you can wait until the page reaches a state where all cookies are set.
  // End of authentication steps.

  await page.context().storageState({ path: authFile });
});
