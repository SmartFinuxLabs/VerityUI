import type { Session } from '@supabase/supabase-js';

export type ParticipantRole = 'Supplier' | 'Buyer' | 'Investor';
export type PartyType = 'SUPPLIER' | 'BUYER' | 'INVESTOR';

export interface ParticipantAccessSnapshot {
  provider: 'supabase' | 'demo';
  email: string;
  participantRole?: ParticipantRole;
  entityName?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
}

const PARTICIPANT_ACCESS_KEY = 'verityui_participant_access';

function normalizeParticipantRole(value: unknown): ParticipantRole | undefined {
  if (value === 'Supplier' || value === 'Buyer' || value === 'Investor') {
    return value;
  }

  return undefined;
}

function normalizePartyType(value: unknown): ParticipantRole | undefined {
  if (value === 'SUPPLIER') {
    return 'Supplier';
  }

  if (value === 'BUYER') {
    return 'Buyer';
  }

  if (value === 'INVESTOR') {
    return 'Investor';
  }

  return undefined;
}

function readStorageValue() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(PARTICIPANT_ACCESS_KEY);
  } catch {
    return null;
  }
}

function writeStorageValue(value: string) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(PARTICIPANT_ACCESS_KEY, value);
  } catch {
    // Ignore storage failures in restrictive browser contexts.
  }
}

function removeStorageValue() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(PARTICIPANT_ACCESS_KEY);
  } catch {
    // Ignore storage failures in restrictive browser contexts.
  }
}

export function storeSupabaseSession(
  session: Session,
  email?: string,
  options?: { participantRole?: ParticipantRole; entityName?: string }
) {
  const metadata = session.user.user_metadata ?? {};
  const participantRole =
    options?.participantRole ?? normalizeParticipantRole(metadata.participantRole) ?? normalizePartyType(metadata.party_type);
  const entityName =
    options?.entityName ??
    (typeof metadata.entityName === 'string'
      ? metadata.entityName
      : typeof metadata.organization_name === 'string'
        ? metadata.organization_name
        : undefined);

  const snapshot: ParticipantAccessSnapshot = {
    provider: 'supabase',
    email: email ?? session.user.email ?? 'signed-in user',
    participantRole,
    entityName,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : undefined,
  };

  writeStorageValue(JSON.stringify(snapshot));
}

export function storeDemoAccess(email: string, options?: { participantRole?: ParticipantRole; entityName?: string }) {
  const snapshot: ParticipantAccessSnapshot = {
    provider: 'demo',
    email,
    participantRole: options?.participantRole,
    entityName: options?.entityName,
  };

  writeStorageValue(JSON.stringify(snapshot));
}

export function getParticipantAccessSnapshot() {
  const rawValue = readStorageValue();

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as ParticipantAccessSnapshot;
  } catch {
    return null;
  }
}

export function hasParticipantAccess() {
  return Boolean(getParticipantAccessSnapshot());
}

export function clearParticipantAccess() {
  removeStorageValue();
}