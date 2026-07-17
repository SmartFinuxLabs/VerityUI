import { expect, test, type Page } from '@playwright/test';

type WorkspaceDeepLink = {
  route: string;
  role: 'Supplier' | 'Buyer' | 'Investor';
  expectedText: RegExp;
  emailEnv: string;
};

const workspaceDeepLinks: WorkspaceDeepLink[] = [
  {
    route: '/supplier-workspace',
    role: 'Supplier',
    expectedText: /Supplier Overview/i,
    emailEnv: 'VERITY_SMOKE_SUPPLIER_EMAIL',
  },
  {
    route: '/buyer-workspace',
    role: 'Buyer',
    expectedText: /Buyer Dashboard/i,
    emailEnv: 'VERITY_SMOKE_BUYER_EMAIL',
  },
  {
    route: '/investor-workspace',
    role: 'Investor',
    expectedText: /Total Committed/i,
    emailEnv: 'VERITY_SMOKE_INVESTOR_EMAIL',
  },
];

async function navigateToAuth(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /^Portal Terminal$/i }).click();
  await expect(page.getByRole('heading', { name: /Sign In to VerityUI/i })).toBeVisible();
}

async function signInWithApiCredentials(page: Page, email: string, password: string) {
  await navigateToAuth(page);
  await page.getByLabel('Work Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
}

test.describe('Phase 1 smoke scenarios', () => {
  const smokePassword = process.env.VERITY_SMOKE_PASSWORD;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.clear();
    });
  });

  test.describe('direct workspace deep links', () => {
    for (const { route, role, expectedText, emailEnv } of workspaceDeepLinks) {
      test(`${route} redirects unauthenticated users to login`, async ({ page }) => {
        await page.goto(route);

        await expect(page).toHaveURL(/\/login$/);
        await expect(page.getByRole('heading', { name: /Sign In to VerityUI/i })).toBeVisible();
      });

      test(`${route} renders ${role} workspace with API access`, async ({ page }) => {
        const email = process.env[emailEnv];
        test.skip(!email || !smokePassword, `${emailEnv} and VERITY_SMOKE_PASSWORD are required for portal smoke.`);

        await signInWithApiCredentials(page, email!, smokePassword!);
        await page.goto(route);

        await expect(page).toHaveURL(new RegExp(`${route}$`));
        await expect(page.getByText(expectedText).first()).toBeVisible({
          timeout: 20_000,
        });
      });
    }
  });
});
