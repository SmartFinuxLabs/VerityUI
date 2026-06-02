import { expect, test, type Page } from '@playwright/test';

type WorkspaceDeepLink = {
  route: string;
  role: 'Supplier' | 'Buyer' | 'Investor';
  expectedText: RegExp;
};

const workspaceDeepLinks: WorkspaceDeepLink[] = [
  {
    route: '/supplier-workspace',
    role: 'Supplier',
    expectedText: /Supplier Overview/i,
  },
  {
    route: '/buyer-workspace',
    role: 'Buyer',
    expectedText: /Buyer Dashboard/i,
  },
  {
    route: '/investor-workspace',
    role: 'Investor',
    expectedText: /Total Committed/i,
  },
];

async function navigateToAuth(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /^Portal Terminal$/i }).click();
  await expect(page.getByRole('heading', { name: /Sign In to VerityUI/i })).toBeVisible();
}

async function registerInDemoMode(
  page: Page,
  role: 'Supplier' | 'Buyer' | 'Investor'
) {
  await page.getByRole('button', { name: 'Register' }).click();
  await page.getByLabel('Full Name').fill(`${role} Smoke User`);
  await page.getByLabel('Entity Name').fill(`${role} Entity`);
  await page.getByLabel('Participant Role').selectOption(role);
  await page.getByLabel('Work Email').fill(`${role.toLowerCase()}+${Date.now()}@phase1-smoke.test`);
  await page.getByLabel('Password').fill('Phase1Smoke!2026');
  await page.getByRole('button', { name: 'Create Participant Account' }).click();
}

async function seedDemoAccess(page: Page, role: WorkspaceDeepLink['role']) {
  await page.goto('/');
  await page.evaluate((participantRole) => {
    window.localStorage.setItem(
      'verityui_participant_access',
      JSON.stringify({
        provider: 'demo',
        email: `${participantRole.toLowerCase()}+deeplink@phase1-smoke.test`,
        participantRole,
        entityName: `${participantRole} Deep Link Entity`,
      })
    );
  }, role);
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

    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page.getByRole('heading', { name: /Sign In to VerityUI/i })).toBeVisible();
  });

  test('Investor registration routes to merged investor workflow screens', async ({ page }) => {
    await navigateToAuth(page);
    await registerInDemoMode(page, 'Investor');

    await expect(page.getByText(/Total Committed/i).first()).toBeVisible();

    await page.getByRole('button', { name: /VIEW OPPORTUNITIES/i }).first().click();

    await expect(page.getByText(/Portfolio Summary/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test.describe('direct workspace deep links', () => {
    for (const { route, role, expectedText } of workspaceDeepLinks) {
      test(`${route} redirects unauthenticated users to login`, async ({ page }) => {
        await page.goto(route);

        await expect(page).toHaveURL(/\/login$/);
        await expect(page.getByRole('heading', { name: /Sign In to VerityUI/i })).toBeVisible();
      });

      test(`${route} renders ${role} workspace with demo access`, async ({ page }) => {
        await seedDemoAccess(page, role);

        await page.goto(route);

        await expect(page).toHaveURL(new RegExp(`${route}$`));
        await expect(page.getByText(expectedText).first()).toBeVisible({
          timeout: 20_000,
        });
      });
    }
  });
});
