import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const RESET_STORE = async () => {
  vi.resetModules();
  const mod = await import('../../src/stores/appStore');
  return mod;
};

describe('appStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('hydrates defaults when localStorage is empty', async () => {
    const { useAppStore } = await RESET_STORE();
    const state = useAppStore.getState();
    expect(state.environment).toBe('production');
    expect(state.contentLanguage).toBe('en');
    expect(state.timezone).toBe('Asia/Shanghai');
    expect(state.environmentChanging).toBe(false);
  });

  it('hydrates from localStorage when valid values are present', async () => {
    localStorage.setItem('dashboard_environment', 'local');
    localStorage.setItem('contentLanguage', 'zh');
    localStorage.setItem('dashboard_timezone', 'Europe/London');

    const { useAppStore } = await RESET_STORE();
    const state = useAppStore.getState();
    expect(state.environment).toBe('local');
    expect(state.contentLanguage).toBe('zh');
    expect(state.timezone).toBe('Europe/London');
  });

  it('falls back to defaults when localStorage has invalid values', async () => {
    localStorage.setItem('dashboard_environment', 'staging');
    localStorage.setItem('contentLanguage', 'jp');
    localStorage.setItem('dashboard_timezone', 'Mars/Olympus');

    const { useAppStore } = await RESET_STORE();
    const state = useAppStore.getState();
    expect(state.environment).toBe('production');
    expect(state.contentLanguage).toBe('en');
    expect(state.timezone).toBe('Asia/Shanghai');
  });

  it('setEnvironment persists, flips environmentChanging, and clears it', async () => {
    vi.useFakeTimers();
    const { useAppStore } = await RESET_STORE();

    act(() => {
      useAppStore.getState().setEnvironment('local');
    });

    expect(useAppStore.getState().environment).toBe('local');
    expect(useAppStore.getState().environmentChanging).toBe(true);
    expect(localStorage.getItem('dashboard_environment')).toBe('local');

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(useAppStore.getState().environmentChanging).toBe(false);
  });

  it('setContentLanguage persists', async () => {
    const { useAppStore } = await RESET_STORE();
    act(() => {
      useAppStore.getState().setContentLanguage('zh');
    });
    expect(useAppStore.getState().contentLanguage).toBe('zh');
    expect(localStorage.getItem('contentLanguage')).toBe('zh');
  });

  it('setTimezone persists', async () => {
    const { useAppStore } = await RESET_STORE();
    act(() => {
      useAppStore.getState().setTimezone('UTC');
    });
    expect(useAppStore.getState().timezone).toBe('UTC');
    expect(localStorage.getItem('dashboard_timezone')).toBe('UTC');
  });

  it('non-React getters return current state', async () => {
    const { useAppStore, getStoredEnvironment, getStoredContentLanguage, getStoredTimezone } =
      await RESET_STORE();
    act(() => {
      useAppStore.getState().setEnvironment('local');
      useAppStore.getState().setContentLanguage('all');
      useAppStore.getState().setTimezone('UTC');
    });
    expect(getStoredEnvironment()).toBe('local');
    expect(getStoredContentLanguage()).toBe('all');
    expect(getStoredTimezone()).toBe('UTC');
  });
});
