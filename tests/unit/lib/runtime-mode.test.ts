import { afterEach, describe, expect, it, vi } from 'vitest';

describe('runtime mode', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('defaults to API mode when VITE_RUN_MODE is unset', async () => {
    vi.stubEnv('VITE_RUN_MODE', undefined);
    vi.resetModules();

    const { verityRunMode } = await import('../../../src/lib/runtimeMode');

    expect(verityRunMode).toBe('api');
  });

  it('ignores legacy demo VITE_RUN_MODE values', async () => {
    vi.stubEnv('VITE_RUN_MODE', 'demo');
    vi.resetModules();

    const { verityRunMode } = await import('../../../src/lib/runtimeMode');

    expect(verityRunMode).toBe('api');
  });
});
