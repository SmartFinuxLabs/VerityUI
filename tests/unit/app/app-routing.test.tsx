import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../../src/App';

function seedAccessSnapshot(snapshot: Record<string, unknown>) {
  window.localStorage.setItem('verityui_participant_access', JSON.stringify(snapshot));
}

function mockWorkspaceFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      if (url.includes('/workspaces/supplier/analytics')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValue({
            data: {
              volumeByStatus: [],
              timeTrends: [],
              cashFlowProjections: [],
              financialHealth: {
                disputeRatio: 0,
                onChainCreditScore: 0,
                totalOutstanding: 0,
                totalFactored: 0,
                liquidityRatio: 0,
              },
              creditHistory: [],
            },
          }),
        });
      }

      if (url.includes('/workspaces/supplier')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValue({
            data: {
              invoices: [],
              registeredBuyers: [],
              availableLiquidity: 0,
              escrowValue: 0,
              onChainCredit: 0,
              walletConnected: false,
              walletAddress: null,
            },
          }),
        });
      }

      if (url.includes('/workspaces/buyer')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValue({
            data: {
              invoices: [],
              fundingRequests: [],
              liquidity: {
                availableLiquidity: 0,
                walletAddress: '',
                walletName: 'VerityAPI',
                isConnected: false,
              },
            },
          }),
        });
      }

      if (url.includes('/workspaces/investor')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValue({
            data: {
              invoices: [],
              settlements: [],
              ledgerRows: [],
              totalCommitted: 0,
              activeInvestments: 0,
              availableCapital: 0,
              projectedYield: 0,
              ytdEarned: 0,
            },
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: {} }),
      });
    })
  );
}

describe('App API-only routing', () => {
  beforeEach(() => {
    mockWorkspaceFetch();
  });

  it('rejects stale demo snapshots and redirects protected routes to login', async () => {
    seedAccessSnapshot({
      provider: 'demo',
      email: 'supplier@test.local',
      participantRole: 'Supplier',
    });

    render(
      <MemoryRouter initialEntries={['/supplier-workspace']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: /Sign In to VerityUI/i })).toBeInTheDocument();
    expect(window.localStorage.getItem('verityui_participant_access')).toBeNull();
  });

  it.each([
    ['Supplier', '/supplier-workspace', /New Funding Request/i],
    ['Buyer', '/buyer-workspace', /Buyer Dashboard/i],
    ['Investor', '/investor-workspace', /Prime Network Node/i],
  ] as const)('routes a valid API %s snapshot to its workspace', async (role, route, expectedText) => {
    seedAccessSnapshot({
      provider: 'api',
      email: `${role.toLowerCase()}@test.local`,
      participantRole: role,
      accessToken: `${role.toLowerCase()}-token`,
    });

    render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText(expectedText).length).toBeGreaterThan(0);
    });
  });
});
