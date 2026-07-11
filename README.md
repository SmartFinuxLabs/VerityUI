# VerityUI

React/Vite frontend for the Verity supply-chain-finance Phase 1 workflows.

## Stack

- Node.js 20+
- React 19
- Vite
- TypeScript
- Vitest
- Playwright

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The dev server runs on `http://localhost:3000`.

## Environment

`VITE_API_BASE_URL` points the UI at VerityAPI. If omitted, the UI uses:

```text
http://localhost:8080/api/v1
```

Portal login always signs in through VerityAPI and loads role workspace state from:

- `GET /workspaces/buyer`
- `GET /workspaces/supplier`
- `GET /workspaces/investor`

Supabase URL, anon key, and service-role key belong in `VerityAPI` only. Do not expose Supabase credentials through Vite browser environment variables.

## Scripts

```bash
npm run dev
npm run lint
npm test
npm run build
```

## Smoke Tests

The smoke suite always validates public routing and unauthenticated portal redirects. Authenticated portal smoke requires seeded VerityAPI users supplied through environment variables:

- `VERITY_SMOKE_SUPPLIER_EMAIL`
- `VERITY_SMOKE_BUYER_EMAIL`
- `VERITY_SMOKE_INVESTOR_EMAIL`
- `VERITY_SMOKE_PASSWORD`

```bash
npx playwright install chromium
npm run smoke:test
```

HTML report output:

```text
playwright-report/smoke
```
