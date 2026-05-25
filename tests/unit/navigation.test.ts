import { describe, expect, it } from 'vitest';
import { navItems, resourceNavItems, routeNavItems } from '../../src/app/navigation';

describe('navigation registry', () => {
  it('exposes exactly one dashboard entry, in the main section at "/"', () => {
    const dashboards = navItems.filter((i) => i.kind === 'dashboard');
    expect(dashboards).toHaveLength(1);
    expect(dashboards[0].path).toBe('/');
    expect(dashboards[0].section).toBe('main');
  });

  it('registers every CRUD resource with a name and a list view', () => {
    for (const r of resourceNavItems) {
      expect(r.name.length).toBeGreaterThan(0);
      expect(r.list).toBeTypeOf('object'); // React.lazy exotic component
    }
  });

  it('covers the expected resource set', () => {
    const names = resourceNavItems.map((r) => r.name).sort();
    expect(names).toEqual(
      [
        'authors',
        'booklists',
        'books',
        'categories',
        'feedback',
        'guest-feedback',
        'import/batches',
        'messages',
        'orders',
        'quotes',
        'tickets',
        'users',
      ].sort()
    );
  });

  it('gives every custom route a lazy component', () => {
    expect(routeNavItems.length).toBeGreaterThan(0);
    for (const r of routeNavItems) {
      expect(r.Component).toBeTypeOf('object');
    }
  });

  it('has unique paths and only known sections', () => {
    const paths = navItems.map((i) => i.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const i of navItems) {
      expect(['main', 'operations', 'support']).toContain(i.section);
    }
  });

  it('exposes the Content Studio external link with an href resolver', () => {
    const external = navItems.filter((i) => i.kind === 'external');
    expect(external).toHaveLength(1);
    const config = { contentStudioUrl: 'https://studio.example' };
    expect(external[0].kind === 'external' && external[0].href(config as never)).toBe(
      'https://studio.example'
    );
  });

  it('every item carries a translatable label key and an icon', () => {
    for (const i of navItems) {
      expect(i.labelKey.startsWith('sidebar.')).toBe(true);
      expect(i.Icon).toBeTruthy();
    }
  });
});
