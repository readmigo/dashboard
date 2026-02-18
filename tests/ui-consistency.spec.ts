import { test, expect } from '@playwright/test';

test.describe('UI Consistency - Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('adminToken', 'mock-admin-token');
      localStorage.setItem('dashboard_environment', 'local');
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('sidebar logo should use the official app-icon.png', async ({ page }) => {
    const logoImg = page.locator('img[alt="Readmigo"]').first();
    await expect(logoImg).toBeVisible();

    const src = await logoImg.getAttribute('src');
    expect(src).toBe('/app-icon.png');
  });

  test('sidebar logo should have correct dimensions and border-radius', async ({ page }) => {
    const logoImg = page.locator('img[alt="Readmigo"]').first();
    await expect(logoImg).toBeVisible();

    const box = await logoImg.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeCloseTo(36, 0);
    expect(box!.height).toBeCloseTo(36, 0);
  });

  test('sidebar should show "Readmigo" brand text', async ({ page }) => {
    const brandText = page.locator('text=Readmigo').first();
    await expect(brandText).toBeVisible();
  });

  test('Service Hub should be visible in sidebar without scrolling', async ({ page }) => {
    const serviceHubLink = page.locator('a[href="/services"]');
    await expect(serviceHubLink).toBeVisible();
  });

  test('sidebar should have all main navigation sections', async ({ page }) => {
    await expect(page.locator('a[href="/"]').first()).toBeVisible();
    await expect(page.locator('a[href="/services"]')).toBeVisible();
    await expect(page.locator('a[href="/books"]')).toBeVisible();
    await expect(page.locator('a[href="/users"]')).toBeVisible();
    await expect(page.locator('a[href="/operations"]')).toBeVisible();
    await expect(page.locator('a[href="/support-dashboard"]')).toBeVisible();
  });
});

test.describe('UI Consistency - Login Page', () => {
  test('login page should display the official app-icon.png', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const logoImg = page.locator('img[alt="Readmigo"]');
    await expect(logoImg).toBeVisible();

    const src = await logoImg.getAttribute('src');
    expect(src).toBe('/app-icon.png');
  });

  test('login page should show Readmigo brand text with gradient', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const brandText = page.locator('h4:has-text("Readmigo")');
    await expect(brandText).toBeVisible();
  });

  test('login page should have email and password fields', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});

test.describe('UI Consistency - Dashboard Home', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('adminToken', 'mock-admin-token');
      localStorage.setItem('dashboard_environment', 'local');
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('dashboard should show stat cards', async ({ page }) => {
    const cards = page.locator('.MuiCard-root');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('dashboard should have a link to Operations Dashboard', async ({ page }) => {
    const opsLink = page.locator('a[href="#/operations"]');
    await expect(opsLink).toBeVisible();
  });
});

test.describe('UI Consistency - Service Hub Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('adminToken', 'mock-admin-token');
      localStorage.setItem('dashboard_environment', 'local');
    });
  });

  test('Service Hub page should load and show service cards', async ({ page }) => {
    await page.goto('/services');
    await page.waitForLoadState('networkidle');

    // Should have a page title with "Service Hub" or its translation
    const title = page.getByText(/Service Hub|服务平台/i).first();
    await expect(title).toBeVisible();

    // Should show service cards (at least 5 services)
    const cards = page.locator('.MuiCard-root');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('Service Hub should show category chips', async ({ page }) => {
    await page.goto('/services');
    await page.waitForLoadState('networkidle');

    // Should have category chip labels
    const chips = page.locator('.MuiChip-root');
    const count = await chips.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
