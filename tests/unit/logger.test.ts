import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearLogs, getLogs, installGlobalLogger, logger } from '../../src/utils/logger';

describe('logger', () => {
  beforeEach(() => {
    clearLogs();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    clearLogs();
  });

  it('records entries for each level', () => {
    logger.error('boom');
    logger.warn('careful', { reason: 'low disk' });
    logger.info('hello');
    logger.data('payload', [1, 2, 3]);

    const logs = getLogs();
    expect(logs).toHaveLength(4);
    expect(logs.map((l) => l.type)).toEqual(['error', 'warn', 'info', 'data']);
    expect(logs[1].data).toEqual({ reason: 'low disk' });
  });

  it('caps the buffer at 200 entries', () => {
    for (let i = 0; i < 250; i++) logger.log(`msg-${i}`);
    const logs = getLogs();
    expect(logs).toHaveLength(200);
    expect(logs[0].message).toBe('msg-50');
    expect(logs[199].message).toBe('msg-249');
  });

  it('installGlobalLogger bridges to window.__DEBUG_LOGS__ and window.__DEBUG_LOG__', () => {
    installGlobalLogger();
    expect(Array.isArray(window.__DEBUG_LOGS__)).toBe(true);
    window.__DEBUG_LOG__('error', 'via window');
    expect(getLogs()).toEqual(window.__DEBUG_LOGS__);
    expect(window.__DEBUG_LOGS__.at(-1)?.message).toBe('via window');
  });

  it('clearLogs empties the buffer', () => {
    logger.log('a');
    logger.log('b');
    clearLogs();
    expect(getLogs()).toHaveLength(0);
  });
});
