import { test as setup } from "@playwright/test"

const authFile = "playwright/.auth/user.json"

// setup('authenticate', async ({ page }) => {
//   // Perform authentication steps. Replace these actions with your own.
//   await page.goto('/');
//   await page.getByLabel('Username or email address').fill('username');
//   await page.getByLabel('Password').fill('password');
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   // Wait until the page receives the cookies.
//   //
//   // Sometimes login flow sets cookies in the process of several redirects.
//   // Wait for the final URL to ensure that the cookies are actually set.
//   await page.waitForURL('https://github.com/');
//   // Alternatively, you can wait until the page reaches a state where all cookies are set.
//   await expect(page.getByRole('button', { name: 'View profile and more' })).toBeVisible();

//   // End of authentication steps.

//   await page.context().storageState({ path: authFile });
// });

setup("authenticate", async ({ page }) => {
  const username = process.env.DISCORD_USERNAME
  const password = process.env.DISCORD_PASSWORD

  if (!username || !password) {
    console.log(username, password, process.env)
    throw new Error("Missing env varibles DISCORD_USERNAME or DISCORD_USERNAME")
  }

  await page.goto("/")
  await page.getByRole("link", { name: "Sign in" }).click()
  await page.getByRole("button", { name: "Sign in with Discord" }).click()
  await page.getByRole("button", { name: "Sign in with Discord" }).click()
  await page.getByLabel("Email or Phone Number").fill(username)
  await page.getByLabel("Password").fill(password)
  await page.getByRole("button", { name: "Log In" }).click()
  await page.getByRole("button", { name: "Authorize" }).click()

  await page.context().storageState({ path: authFile })
  console.log(page.context().cookies())
})
