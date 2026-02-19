import { test, expect, Page } from '@playwright/test';

// Auth bypass: VITE_AUTH_DISABLED=true auto-logs in with dev-token
// Environment defaults to 'production', we want 'local' for API mock/real API
// The page uses useEnvironment() → apiBaseUrl, which reads from localStorage

async function setupAuth(page: Page) {
  await page.goto('/');
  // Set auth token and environment to production (where real API lives)
  await page.evaluate(() => {
    localStorage.setItem('adminToken', 'dev-token');
    localStorage.setItem('adminUser', JSON.stringify({
      id: 'dev-admin',
      email: 'admin@readmigo.com',
      displayName: 'Dev Admin',
      roles: ['admin'],
    }));
    // Use production API since that's where push endpoints exist
    localStorage.setItem('dashboard_environment', 'production');
  });
}

test.describe('Push Notifications Page', () => {

  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  // ─── Page Load & Navigation ──────────────────────────────────────────────

  test('page loads and shows title', async ({ page }) => {
    await page.goto('/push-notifications');
    await expect(page.getByText('Push Notifications').first()).toBeVisible({ timeout: 15000 });
  });

  test('page shows subtitle', async ({ page }) => {
    await page.goto('/push-notifications');
    await expect(page.getByText('Send push notifications to users and view send history')).toBeVisible({ timeout: 15000 });
  });

  test('page shows broadcast warning alert', async ({ page }) => {
    await page.goto('/push-notifications');
    await expect(page.locator('.MuiAlert-root')).toBeVisible({ timeout: 15000 });
  });

  // ─── Stats Panel ──────────────────────────────────────────────────────────

  test('stats panel shows 4 KPI cards', async ({ page }) => {
    await page.goto('/push-notifications');
    // Wait for the page to load
    await expect(page.getByText('Push Notifications').first()).toBeVisible({ timeout: 15000 });

    // 4 StatCards inside the stats Grid
    const statCards = page.locator('.MuiCard-root').filter({ has: page.locator('.MuiTypography-overline') });
    await expect(statCards).toHaveCount(4, { timeout: 10000 });
  });

  test('stats panel shows trend chart area', async ({ page }) => {
    await page.goto('/push-notifications');
    await expect(page.getByText('7-Day Push Trend')).toBeVisible({ timeout: 15000 });
  });

  test('stats panel shows top types chart', async ({ page }) => {
    await page.goto('/push-notifications');
    await expect(page.getByText('Top Push Types')).toBeVisible({ timeout: 15000 });
  });

  // ─── Tab Navigation ──────────────────────────────────────────────────────

  test('3 tabs visible: Send, Templates, History', async ({ page }) => {
    await page.goto('/push-notifications');
    await expect(page.getByRole('tab', { name: 'Send' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('tab', { name: 'Templates' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'History' })).toBeVisible();
  });

  test('Send tab is active by default', async ({ page }) => {
    await page.goto('/push-notifications');
    const sendTab = page.getByRole('tab', { name: 'Send' });
    await expect(sendTab).toBeVisible({ timeout: 15000 });
    await expect(sendTab).toHaveAttribute('aria-selected', 'true');
  });

  test('clicking Templates tab shows templates panel', async ({ page }) => {
    await page.goto('/push-notifications');
    await page.getByRole('tab', { name: 'Templates' }).click();
    await expect(page.getByText('Notification Templates')).toBeVisible({ timeout: 10000 });
  });

  test('clicking History tab shows push history', async ({ page }) => {
    await page.goto('/push-notifications');
    await page.getByRole('tab', { name: 'History' }).click();
    await expect(page.getByText('Push History')).toBeVisible({ timeout: 10000 });
  });

  // ─── Send Form ────────────────────────────────────────────────────────────

  test('send form shows all required fields', async ({ page }) => {
    await page.goto('/push-notifications');
    await expect(page.getByText('Send Notification').first()).toBeVisible({ timeout: 15000 });

    // Title field
    await expect(page.getByLabel('Title')).toBeVisible();

    // Body field
    await expect(page.getByLabel('Body')).toBeVisible();

    // Deep Link field
    await expect(page.getByLabel('Deep Link (optional)')).toBeVisible();

    // Target type selector (MUI Select renders label + legend span)
    await expect(page.locator('label').filter({ hasText: 'Target Type' })).toBeVisible();

    // Send button
    await expect(page.getByRole('button', { name: /Send Notification/i })).toBeVisible();
  });

  test('send button is disabled when form is empty', async ({ page }) => {
    await page.goto('/push-notifications');
    await expect(page.getByText('Send Notification').first()).toBeVisible({ timeout: 15000 });

    const sendBtn = page.getByRole('button', { name: /Send Notification/i });
    await expect(sendBtn).toBeDisabled();
  });

  test('send button becomes enabled after filling title and body', async ({ page }) => {
    await page.goto('/push-notifications');
    await expect(page.getByText('Send Notification').first()).toBeVisible({ timeout: 15000 });

    await page.getByLabel('Title').fill('Test Push');
    await page.getByLabel('Body').fill('This is a test notification');

    const sendBtn = page.getByRole('button', { name: /Send Notification/i });
    await expect(sendBtn).toBeEnabled();
  });

  test('title field shows character count', async ({ page }) => {
    await page.goto('/push-notifications');
    await expect(page.getByText('Send Notification').first()).toBeVisible({ timeout: 15000 });

    await page.getByLabel('Title').fill('Hello');
    await expect(page.getByText('5/100')).toBeVisible();
  });

  test('body field shows character count', async ({ page }) => {
    await page.goto('/push-notifications');
    await expect(page.getByText('Send Notification').first()).toBeVisible({ timeout: 15000 });

    await page.getByLabel('Body').fill('Test body');
    await expect(page.getByText('9/300')).toBeVisible();
  });

  test('selecting segment target type shows segment dropdown', async ({ page }) => {
    await page.goto('/push-notifications');
    await expect(page.getByText('Send Notification').first()).toBeVisible({ timeout: 15000 });

    // MUI Select: click on the select element with role combobox inside the Target Type form control
    const targetTypeSelect = page.locator('.MuiFormControl-root', { hasText: 'Target Type' }).getByRole('combobox');
    await targetTypeSelect.click();
    await page.getByRole('option', { name: 'User Segment' }).click();

    // Segment dropdown should appear
    await expect(page.getByText('Segment').nth(0)).toBeVisible();
  });

  test('selecting users target type shows user IDs input', async ({ page }) => {
    await page.goto('/push-notifications');
    await expect(page.getByText('Send Notification').first()).toBeVisible({ timeout: 15000 });

    const targetTypeSelect = page.locator('.MuiFormControl-root', { hasText: 'Target Type' }).getByRole('combobox');
    await targetTypeSelect.click();
    await page.getByRole('option', { name: 'Specific Users' }).click();

    await expect(page.getByLabel('User IDs')).toBeVisible();
    await expect(page.getByText('Enter user IDs separated by commas')).toBeVisible();
  });

  test('clicking send opens confirmation dialog', async ({ page }) => {
    await page.goto('/push-notifications');
    await expect(page.getByText('Send Notification').first()).toBeVisible({ timeout: 15000 });

    await page.getByLabel('Title').fill('Test Push');
    await page.getByLabel('Body').fill('This is a test notification');

    await page.getByRole('button', { name: /Send Notification/i }).click();

    // Confirm dialog should appear
    await expect(page.getByText('Confirm Send')).toBeVisible();
    await expect(page.getByText('This action cannot be undone')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send Now' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('canceling confirm dialog closes it', async ({ page }) => {
    await page.goto('/push-notifications');
    await expect(page.getByText('Send Notification').first()).toBeVisible({ timeout: 15000 });

    await page.getByLabel('Title').fill('Test');
    await page.getByLabel('Body').fill('Test body');
    await page.getByRole('button', { name: /Send Notification/i }).click();

    await expect(page.getByText('Confirm Send')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Dialog should close
    await expect(page.getByText('Confirm Send')).not.toBeVisible();
  });

  // ─── Templates Tab ──────────────────────────────────────────────────────

  test('templates tab shows create button', async ({ page }) => {
    await page.goto('/push-notifications');
    await page.getByRole('tab', { name: 'Templates' }).click();

    await expect(page.getByRole('button', { name: /New Template/i })).toBeVisible({ timeout: 10000 });
  });

  test('templates tab shows table headers', async ({ page }) => {
    await page.goto('/push-notifications');
    await page.getByRole('tab', { name: 'Templates' }).click();

    await expect(page.getByText('Notification Templates')).toBeVisible({ timeout: 10000 });

    // Table headers
    const headers = ['Name', 'Type', 'Title Template', 'Body Template', 'Status', 'Time'];
    for (const header of headers) {
      await expect(page.getByRole('columnheader', { name: header }).or(page.locator('th').filter({ hasText: header }))).toBeVisible();
    }
  });

  test('clicking New Template opens create dialog', async ({ page }) => {
    await page.goto('/push-notifications');
    await page.getByRole('tab', { name: 'Templates' }).click();

    await page.getByRole('button', { name: /New Template/i }).click();
    await expect(page.getByText('Create Template')).toBeVisible();
  });

  test('template create dialog has required fields', async ({ page }) => {
    await page.goto('/push-notifications');
    await page.getByRole('tab', { name: 'Templates' }).click();
    await page.getByRole('button', { name: /New Template/i }).click();

    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Type')).toBeVisible();
    await expect(page.getByLabel('Title Template')).toBeVisible();
    await expect(page.getByLabel('Body Template')).toBeVisible();
  });

  test('template dialog shows variable hint', async ({ page }) => {
    await page.goto('/push-notifications');
    await page.getByRole('tab', { name: 'Templates' }).click();
    await page.getByRole('button', { name: /New Template/i }).click();

    await expect(page.getByText('Use {{variable}} placeholders')).toBeVisible();
  });

  test('template dialog shows preview when content is entered', async ({ page }) => {
    await page.goto('/push-notifications');
    await page.getByRole('tab', { name: 'Templates' }).click();
    await page.getByRole('button', { name: /New Template/i }).click();

    await page.getByLabel('Title Template').fill('Hello {{username}}');
    await page.getByLabel('Body Template').fill('You have {{count}} new books');

    await expect(page.getByText('Preview')).toBeVisible();
    await expect(page.getByText('Hello {{username}}')).toBeVisible();
    // Use the preview paragraph specifically (not the textarea)
    await expect(page.locator('p').filter({ hasText: 'You have {{count}} new books' })).toBeVisible();
  });

  test('template save button disabled when required fields empty', async ({ page }) => {
    await page.goto('/push-notifications');
    await page.getByRole('tab', { name: 'Templates' }).click();
    await page.getByRole('button', { name: /New Template/i }).click();

    const saveBtn = page.getByRole('button', { name: /Save/i });
    await expect(saveBtn).toBeDisabled();
  });

  // ─── History Tab ──────────────────────────────────────────────────────────

  test('history tab shows table and filters', async ({ page }) => {
    await page.goto('/push-notifications');
    await page.getByRole('tab', { name: 'History' }).click();

    await expect(page.getByText('Push History')).toBeVisible({ timeout: 10000 });

    // Filter button (exact match to avoid matching env selector)
    await expect(page.getByRole('button', { name: 'Filter', exact: true })).toBeVisible();
    // Status and Type filter labels exist
    await expect(page.locator('label').filter({ hasText: 'Status' })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Type' })).toBeVisible();
  });

  test('history tab shows table columns', async ({ page }) => {
    await page.goto('/push-notifications');
    await page.getByRole('tab', { name: 'History' }).click();

    await expect(page.getByText('Push History')).toBeVisible({ timeout: 10000 });

    // Column headers
    const headers = ['Time', 'Title', 'Body', 'Type', 'Status', 'Target'];
    for (const header of headers) {
      await expect(page.locator('th').filter({ hasText: header })).toBeVisible();
    }
  });

  test('history tab has pagination', async ({ page }) => {
    await page.goto('/push-notifications');
    await page.getByRole('tab', { name: 'History' }).click();

    await expect(page.getByText('Push History')).toBeVisible({ timeout: 10000 });

    // MUI TablePagination
    await expect(page.locator('.MuiTablePagination-root')).toBeVisible();
  });

  // ─── Sidebar Navigation ──────────────────────────────────────────────────

  test('push notifications link in sidebar menu', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav, [class*="Menu"]').getByText('Push Notifications')).toBeVisible({ timeout: 15000 });
  });

  test('sidebar link navigates to push page', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav, [class*="Menu"]').getByText('Push Notifications').click();
    await expect(page).toHaveURL(/push-notifications/);
    await expect(page.getByText('Send push notifications to users')).toBeVisible({ timeout: 10000 });
  });
});
