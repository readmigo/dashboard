import { beforeEach, describe, expect, it, vi } from 'vitest';
import { httpRequest } from '../../src/utils/api-client';
import { ApiError } from '../../src/types/api';

const mockFetchJson = vi.fn();
vi.mock('react-admin', () => ({
  fetchUtils: {
    fetchJson: (...args: unknown[]) => mockFetchJson(...args),
  },
}));

describe('httpRequest', () => {
  beforeEach(() => {
    mockFetchJson.mockReset();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('returns the underlying response on success', async () => {
    mockFetchJson.mockResolvedValueOnce({
      status: 200,
      headers: new Headers(),
      body: '',
      json: { ok: true },
    });

    const result = await httpRequest('https://api.example/x');
    expect(result.json).toEqual({ ok: true });
    expect(mockFetchJson).toHaveBeenCalledWith('https://api.example/x', {});
  });

  it('wraps errors with status/body into ApiError', async () => {
    mockFetchJson.mockRejectedValueOnce({
      status: 404,
      body: { message: 'Not found' },
      message: 'Not Found',
    });

    await expect(httpRequest('https://api.example/missing')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      body: { message: 'Not found' },
      url: 'https://api.example/missing',
    });

    try {
      await httpRequest('https://api.example/missing');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
    }
  });

  it('rethrows non-object errors unchanged', async () => {
    const failure = 'network down';
    mockFetchJson.mockRejectedValueOnce(failure);

    await expect(httpRequest('https://api.example/y')).rejects.toBe(failure);
  });

  it('defaults missing status to 0 when error has no status', async () => {
    mockFetchJson.mockRejectedValueOnce({ message: 'oops' });

    try {
      await httpRequest('https://api.example/z');
      throw new Error('should not reach');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(0);
      expect((e as ApiError).message).toBe('oops');
    }
  });
});
