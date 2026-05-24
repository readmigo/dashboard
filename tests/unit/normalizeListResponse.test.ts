import { describe, expect, it } from 'vitest';
import { normalizeListResponse } from '../../src/types/api';

describe('normalizeListResponse', () => {
  it('reads { items, total } shape', () => {
    const result = normalizeListResponse({ items: [{ id: 1 }, { id: 2 }], total: 42 });
    expect(result).toEqual({ data: [{ id: 1 }, { id: 2 }], total: 42 });
  });

  it('reads { data, total } shape', () => {
    const result = normalizeListResponse({ data: [{ id: 1 }], total: 1 });
    expect(result).toEqual({ data: [{ id: 1 }], total: 1 });
  });

  it('reads legacy { tickets } shape and falls back total to data length', () => {
    const result = normalizeListResponse({ tickets: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] });
    expect(result).toEqual({ data: [{ id: 'a' }, { id: 'b' }, { id: 'c' }], total: 3 });
  });

  it('reads legacy { feedbacks } and { orders } shapes', () => {
    expect(normalizeListResponse({ feedbacks: [{ id: 1 }] })).toEqual({ data: [{ id: 1 }], total: 1 });
    expect(normalizeListResponse({ orders: [{ id: 1 }] })).toEqual({ data: [{ id: 1 }], total: 1 });
  });

  it('treats bare arrays as the list', () => {
    expect(normalizeListResponse([{ id: 1 }, { id: 2 }])).toEqual({
      data: [{ id: 1 }, { id: 2 }],
      total: 2,
    });
  });

  it('returns empty result for null/undefined/non-object', () => {
    expect(normalizeListResponse(null)).toEqual({ data: [], total: 0 });
    expect(normalizeListResponse(undefined)).toEqual({ data: [], total: 0 });
  });

  it('prefers items over other keys when multiple are present', () => {
    const result = normalizeListResponse({
      items: [{ id: 'preferred' }],
      data: [{ id: 'fallback' }],
      tickets: [{ id: 'legacy' }],
      total: 99,
    });
    expect(result).toEqual({ data: [{ id: 'preferred' }], total: 99 });
  });
});
