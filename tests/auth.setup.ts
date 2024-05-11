import { test as setup } from "@playwright/test"

const authFile = "playwright/.auth/user.json"

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
  await page.getByLabel("Email or Phone Number").fill(username)
  await page.getByLabel("Password").fill(password)
  await page.getByRole("button", { name: "Log In" }).click()
  await page.getByRole("button", { name: "Authorize" }).click()

  await page.waitForURL("/")

  await page.context().storageState({ path: authFile })
})
