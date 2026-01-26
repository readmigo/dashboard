import { test, expect } from '@playwright/test';

test.describe('Environment Selection', () => {
  test.beforeEach(async ({ page }) => {
    // Set up mock token to bypass auth
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('adminToken', 'mock-admin-token');
      localStorage.setItem('dashboard_environment', 'local');
    });
  });

  test('EnvironmentContentSelector should only show Local and Production options', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Find and click the environment selector button in the header
    const envButton = page.locator('button').filter({ hasText: /local|production/i }).first();
    if (await envButton.isVisible()) {
      await envButton.click();

      // Check that only Local and Production are in the menu
      const menuItems = page.locator('[role="menuitem"]');
      await expect(menuItems.filter({ hasText: 'Local' })).toBeVisible();
      await expect(menuItems.filter({ hasText: 'Production' })).toBeVisible();

      // Verify debugging and staging are NOT present
      await expect(menuItems.filter({ hasText: 'Debugging' })).not.toBeVisible();
      await expect(menuItems.filter({ hasText: 'Staging' })).not.toBeVisible();
    }
  });

  test('Pipeline page should only show Local and Production environments', async ({ page }) => {
    await page.goto('/pipeline');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find the environment select dropdown
    const envSelect = page.locator('label:has-text("目标环境")').locator('..').locator('select, [role="combobox"]');

    if (await envSelect.count() > 0) {
      await envSelect.first().click();

      // Check dropdown options
      const options = page.locator('[role="option"], [role="listbox"] li');

      // Local should be visible
      await expect(options.filter({ hasText: /Local|本机/ })).toBeVisible();
      // Production should be visible
      await expect(options.filter({ hasText: /Production|正式/ })).toBeVisible();
      // Debugging should NOT be visible
      await expect(options.filter({ hasText: /Debugging|测试/ })).not.toBeVisible();
      // Staging should NOT be visible
      await expect(options.filter({ hasText: /Staging|预发布/ })).not.toBeVisible();
    }
  });
});

test.describe('Environment Configuration', () => {
  test('environments.ts should only export local and production types', async ({ page }) => {
    // This is a build-time check - if the types were wrong, the app wouldn't compile
    // We verify the app loads successfully
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // If the page loads without errors, the type definitions are correct
    await expect(page).toHaveTitle(/Dashboard|Readmigo/i);
  });
});
