import { afterEach, describe, expect, it, vi } from 'vitest';

describe('runtime mode', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('defaults to demo mode so local login does not require VerityAPI', async () => {
    vi.stubEnv('VITE_RUN_MODE', undefined);
    vi.resetModules();

    const { isDemoMode, verityRunMode } = await import('../../../src/lib/runtimeMode');

    expect(verityRunMode).toBe('demo');
    expect(isDemoMode()).toBe(true);
  });

  it('uses API mode only when VITE_RUN_MODE is explicitly api', async () => {
    vi.stubEnv('VITE_RUN_MODE', 'api');
    vi.resetModules();

    const { isDemoMode, verityRunMode } = await import('../../../src/lib/runtimeMode');

    expect(verityRunMode).toBe('api');
    expect(isDemoMode()).toBe(false);
  });
});
