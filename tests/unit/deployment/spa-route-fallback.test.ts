import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('SPA route fallback deployment config', () => {
  it('configures Vercel to rewrite BrowserRouter deep links to the app shell', () => {
    const configPath = resolve(process.cwd(), 'vercel.json');
    const config = JSON.parse(readFileSync(configPath, 'utf8')) as {
      rewrites?: Array<{ source?: string; destination?: string }>;
    };

    expect(config.rewrites).toContainEqual({
      source: '/(.*)',
      destination: '/index.html',
    });
  });

  it('ships a generic static-host redirect fallback in the public assets', () => {
    const redirectsPath = resolve(process.cwd(), 'public/_redirects');

    expect(existsSync(redirectsPath)).toBe(true);
    expect(readFileSync(redirectsPath, 'utf8')).toContain('/* /index.html 200');
  });
});
