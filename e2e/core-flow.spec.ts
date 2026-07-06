import { test, expect } from "@playwright/test";

// One user per run so the suite is re-runnable against the same database.
const email = `e2e-${Date.now()}@example.com`;
const password = "test-password-123";

test.describe.configure({ mode: "serial" });

test("landing page is public and offers login/signup", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("DSA & System Design");
  await expect(page.getByRole("link", { name: "Log in" }).first()).toBeVisible();
});

test("protected routes redirect anonymous visitors to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("signup → browse topic → solve question → progress persists", async ({ page }) => {
  // Sign up and land on the dashboard.
  await page.goto("/signup");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel(/Password/).fill(password);
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  await expect(page.getByText("Questions solved")).toBeVisible();

  // Navigate to a topic from the sidebar.
  await page.getByRole("link", { name: /Two Pointers/ }).first().click();
  await expect(page.getByRole("heading", { name: "Two Pointers", level: 1 })).toBeVisible();
  await expect(page.getByText("Practice questions")).toBeVisible();

  // Mark theory as read.
  await page.getByRole("button", { name: "Mark theory as read" }).click();
  await expect(page.getByRole("button", { name: /Theory read/ })).toBeVisible();

  // Work the first question: reveal a hint, peek the solution, mark solved.
  const card = page.locator("[data-question]").first();
  await card.getByRole("button", { name: /Reveal hint 1/ }).click();
  await expect(card.getByText("Hint 1:")).toBeVisible();
  await card.getByRole("button", { name: "Show solution" }).click();
  await expect(card.getByRole("button", { name: "Hide solution" })).toBeVisible();
  await card.getByRole("button", { name: "Solved", exact: true }).click();
  await expect(card.getByText("Solved", { exact: true })).toBeVisible();

  // Progress shows up on the dashboard and survives a fresh navigation.
  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText(/1\/\d+/).first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Two Pointers/ }).first()
  ).toBeVisible();

  // Streak reflects today's activity.
  await expect(page.getByText(/1 day\b/)).toBeVisible();
});

test("progress persists across logout and login", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  await expect(page.getByText(/1\/\d+/).first()).toBeVisible();
});
