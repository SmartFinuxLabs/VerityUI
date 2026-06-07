export type VerityRunMode = 'demo' | 'api';

function resolveRunMode(value: unknown): VerityRunMode {
  return typeof value === 'string' && value.trim().toLowerCase() === 'api' ? 'api' : 'demo';
}

export const verityRunMode: VerityRunMode = resolveRunMode(import.meta.env.VITE_RUN_MODE);

export function isDemoMode() {
  return verityRunMode === 'demo';
}
