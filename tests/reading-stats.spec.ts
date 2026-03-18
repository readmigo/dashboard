import { test, expect } from '@playwright/test';

// Mock data matching backend API response format (seconds-based)
const mockOverview = {
  totalReadingSeconds: 740700, // 12345 minutes
  totalSessions: 567,
  activeReaders: 89,
  booksBeingRead: 34,
  averageSessionDuration: 1320, // 22 minutes in seconds
  averageDailySeconds: 2700,
};

const mockBooks = {
  items: [
    {
      rank: 1,
      bookId: 'book-1',
      title: 'Test Book One',
      author: 'Author A',
      coverUrl: '',
      totalReadingSeconds: 6000,
      uniqueReaders: 10,
      totalSessions: 20,
      averageSecondsPerReader: 600,
    },
    {
      rank: 2,
      bookId: 'book-2',
      title: 'Test Book Two',
      author: 'Author B',
      coverUrl: '',
      totalReadingSeconds: 3600,
      uniqueReaders: 5,
      totalSessions: 10,
      averageSecondsPerReader: 720,
    },
  ],
};

const mockUsers = {
  items: [
    {
      rank: 1,
      userId: 'user-1',
      displayName: 'Test User',
      totalReadingSeconds: 12000,
      booksReadCount: 5,
      totalSessions: 30,
      averageSessionDuration: 400,
      daysActive: 15,
    },
  ],
};

const mockCategories = {
  items: [
    {
      categoryId: 'cat-1',
      categoryName: 'Fiction',
      totalReadingSeconds: 30000,
      percentage: 60,
      uniqueReaders: 20,
      booksCount: 10,
      averageSecondsPerUser: 1500,
    },
    {
      categoryId: 'cat-2',
      categoryName: 'Non-Fiction',
      totalReadingSeconds: 20000,
      percentage: 40,
      uniqueReaders: 15,
      booksCount: 8,
      averageSecondsPerUser: 1333,
    },
  ],
};

const mockTimePatterns = {
  items: [
    { hour: 8, totalSeconds: 6000, sessionsCount: 20, uniqueUsers: 10 },
    { hour: 12, totalSeconds: 4800, sessionsCount: 15, uniqueUsers: 8 },
    { hour: 20, totalSeconds: 9000, sessionsCount: 30, uniqueUsers: 15 },
  ],
};

const mockTrend = {
  items: [
    { date: '2026-03-01', totalSeconds: 6000, sessionsCount: 20, activeUsers: 10, averageSecondsPerUser: 600 },
    { date: '2026-03-02', totalSeconds: 7200, sessionsCount: 25, activeUsers: 12, averageSecondsPerUser: 600 },
    { date: '2026-03-03', totalSeconds: 5400, sessionsCount: 18, activeUsers: 9, averageSecondsPerUser: 600 },
  ],
};

function setupMockRoutes(page: import('@playwright/test').Page) {
  return Promise.all([
    page.route('**/api/v1/admin/reading-stats/overview', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockOverview) });
    }),
    page.route('**/api/v1/admin/reading-stats/books*', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockBooks) });
    }),
    page.route('**/api/v1/admin/reading-stats/users*', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockUsers) });
    }),
    page.route('**/api/v1/admin/reading-stats/categories', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCategories) });
    }),
    page.route('**/api/v1/admin/reading-stats/time-patterns*', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockTimePatterns) });
    }),
    page.route('**/api/v1/admin/reading-stats/trend*', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockTrend) });
    }),
  ]);
}

function setupAuth(page: import('@playwright/test').Page) {
  return page.addInitScript(() => {
    sessionStorage.setItem('adminToken', 'test-token');
    sessionStorage.setItem('adminUser', JSON.stringify({
      id: 'test-admin',
      email: 'admin@readmigo.com',
      displayName: 'Test Admin',
      roles: ['admin'],
    }));
    localStorage.setItem('dashboard_environment', 'production');
  });
}

test.describe('Reading Stats Page', () => {
  test('should render overview stats correctly with seconds-to-minutes conversion', async ({ page }) => {
    await setupMockRoutes(page);
    await setupAuth(page);

    await page.goto('/reading-stats');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify no react-admin error page
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Something went wrong');
    expect(pageContent).not.toContain('出错了');
    expect(pageContent).not.toContain('API errors');

    // Verify overview cards display converted minutes (740700 seconds = 12345 minutes)
    expect(pageContent).toContain('12,345');
    // Active readers
    expect(pageContent).toContain('89');
    // Total sessions
    expect(pageContent).toContain('567');

    await page.screenshot({ path: 'tests/screenshots/reading-stats-success.png', fullPage: true });
  });

  test('should render book ranking table with seconds converted to minutes', async ({ page }) => {
    await setupMockRoutes(page);
    await setupAuth(page);

    await page.goto('/reading-stats');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Books tab should be visible by default
    expect(await page.textContent('body')).toContain('Test Book One');
    expect(await page.textContent('body')).toContain('Author A');
    // 6000 seconds = 100 minutes
    expect(await page.textContent('body')).toContain('100');
  });

  test('should render categories tab correctly', async ({ page }) => {
    await setupMockRoutes(page);
    await setupAuth(page);

    await page.goto('/reading-stats');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click categories tab
    await page.getByRole('tab', { name: /categories/i }).click();
    await page.waitForTimeout(500);

    const content = await page.textContent('body');
    expect(content).toContain('Fiction');
    expect(content).toContain('Non-Fiction');
    expect(content).toContain('60.0%');
    // 30000 seconds = 500 minutes
    expect(content).toContain('500');
  });

  test('should render time patterns tab correctly', async ({ page }) => {
    await setupMockRoutes(page);
    await setupAuth(page);

    await page.goto('/reading-stats');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click time patterns tab
    await page.getByRole('tab', { name: /time patterns/i }).click();
    await page.waitForTimeout(500);

    const content = await page.textContent('body');
    expect(content).toContain('Reading Activity by Hour');
    // 9000 seconds = 150 minutes
    expect(content).toContain('150');
  });

  test('should handle API errors gracefully without crashing', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.route('**/api/v1/admin/reading-stats/**', (route) => {
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Internal Server Error' }) });
    });
    await setupAuth(page);

    await page.goto('/reading-stats');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const content = await page.textContent('body');
    // Should show error message in Alert, NOT react-admin error page
    expect(content).not.toContain('出错了');
    expect(content).toContain('API errors');
    // Should show retry button
    expect(content).toContain('Retry');
    // No uncaught exceptions
    expect(pageErrors).toHaveLength(0);
  });

  test('should handle empty data gracefully', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.route('**/api/v1/admin/reading-stats/overview', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        totalReadingSeconds: 0, totalSessions: 0, activeReaders: 0,
        booksBeingRead: 0, averageSessionDuration: 0, averageDailySeconds: 0,
      }) });
    });
    await page.route('**/api/v1/admin/reading-stats/books*', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [] }) });
    });
    await page.route('**/api/v1/admin/reading-stats/users*', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [] }) });
    });
    await page.route('**/api/v1/admin/reading-stats/categories', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [] }) });
    });
    await page.route('**/api/v1/admin/reading-stats/time-patterns*', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [] }) });
    });
    await page.route('**/api/v1/admin/reading-stats/trend*', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [] }) });
    });
    await setupAuth(page);

    await page.goto('/reading-stats');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const content = await page.textContent('body');
    expect(content).not.toContain('出错了');
    expect(pageErrors).toHaveLength(0);

    // Click through all tabs to ensure no crashes
    await page.getByRole('tab', { name: /users/i }).click();
    await page.waitForTimeout(300);
    await page.getByRole('tab', { name: /categories/i }).click();
    await page.waitForTimeout(300);
    await page.getByRole('tab', { name: /time patterns/i }).click();
    await page.waitForTimeout(300);

    expect(pageErrors).toHaveLength(0);
  });
});
