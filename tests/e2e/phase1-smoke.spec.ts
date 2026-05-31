import { expect, test, type Page } from '@playwright/test';

async function navigateToAuth(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'START FREE TRIAL' }).first().click();
  await expect(page.getByRole('heading', { name: /Sign In to VerityUI/i })).toBeVisible();
}

async function registerInDemoMode(
  page: Page,
  role: 'Supplier' | 'Buyer' | 'Investor'
) {
  await page.getByRole('button', { name: 'Register' }).click();
  await page.getByLabel('Entity Name').fill(`${role} Entity`);
  await page.getByLabel('Participant Role').selectOption(role);
  await page.getByLabel('Work Email').fill(`${role.toLowerCase()}+${Date.now()}@phase1-smoke.test`);
  await page.getByLabel('Password').fill('Phase1Smoke!2026');
  await page.getByRole('button', { name: 'Create Participant Account' }).click();
}

test.describe('Phase 1 smoke scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.clear();
    });
  });

  test('Supplier registration routes to supplier dashboard', async ({ page }) => {
    await navigateToAuth(page);
    await registerInDemoMode(page, 'Supplier');
    await expect(page.getByRole('heading', { name: /Supplier Overview/i })).toBeVisible();
  });

  test('Buyer registration routes to isolated buyer workspace', async ({ page }) => {
    await navigateToAuth(page);
    await registerInDemoMode(page, 'Buyer');
    await expect(page.getByText(/Buyer Dashboard/i).first()).toBeVisible();
  });

  test('Investor factoring flow transitions into settlement', async ({ page }) => {
    await navigateToAuth(page);
    await registerInDemoMode(page, 'Investor');

    await expect(page.getByRole('heading', { name: /Request Factoring/i })).toBeVisible();

    await page.getByRole('button', { name: /Submit to Marketplace/i }).click();

    await expect(page.getByRole('heading', { name: /Invoice Settlement/i })).toBeVisible({
      timeout: 20_000,
    });
  });
});
