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

`VITE_RUN_MODE` controls workspace data behavior:

```text
VITE_RUN_MODE=demo
```

Demo mode always uses local fixture data and does not call VerityAPI workspace endpoints, even if an API session is stored in browser localStorage.

```text
VITE_RUN_MODE=api
```

API mode signs in through VerityAPI and loads role workspace state from:

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

The smoke suite runs the UI in demo mode and validates role-based flows for Supplier, Buyer, and Investor workspaces.

```bash
npx playwright install chromium
npm run smoke:test
```

HTML report output:

```text
playwright-report/smoke
```
