import { describe, expect, it } from 'vitest';
import { getFundingStatusDisplay, isActiveFundingStatus } from '../../../src/lib/fundingStatusDisplay';

describe('funding status display helper', () => {
  it('maps marketplace funding statuses to business-facing labels', () => {
    expect(getFundingStatusDisplay('NOT_LISTED')).toMatchObject({ label: 'Not Listed' });
    expect(getFundingStatusDisplay('ELIGIBLE')).toMatchObject({ label: 'Eligible' });
    expect(getFundingStatusDisplay('LISTED')).toMatchObject({ label: 'Marketplace Listed' });
    expect(getFundingStatusDisplay('COMMITTED')).toMatchObject({ label: 'Investor Committed' });
    expect(getFundingStatusDisplay('FUNDED')).toMatchObject({ label: 'Funded' });
    expect(getFundingStatusDisplay('CANCELLED')).toMatchObject({ label: 'Cancelled' });
    expect(getFundingStatusDisplay('EXPIRED')).toMatchObject({ label: 'Expired' });
  });

  it('falls back to Not Listed for missing or unknown funding statuses', () => {
    expect(getFundingStatusDisplay(undefined)).toMatchObject({
      label: 'Not Listed',
      canonicalStatus: 'NOT_LISTED',
    });
    expect(getFundingStatusDisplay('unexpected')).toMatchObject({
      label: 'Not Listed',
      canonicalStatus: 'NOT_LISTED',
    });
  });

  it('identifies statuses that block another supplier financing request', () => {
    expect(isActiveFundingStatus('OPEN')).toBe(true);
    expect(isActiveFundingStatus('LISTED')).toBe(true);
    expect(isActiveFundingStatus('PARTIALLY_FILLED')).toBe(true);
    expect(isActiveFundingStatus('FILLED')).toBe(true);
    expect(isActiveFundingStatus('EXPIRED')).toBe(false);
    expect(isActiveFundingStatus('CANCELLED')).toBe(false);
    expect(isActiveFundingStatus(undefined)).toBe(false);
  });
});
