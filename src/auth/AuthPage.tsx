import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { verityApi } from '../lib/apiClient';
import { ParticipantRole, PartyType, storeApiSession, storeDemoAccess } from '../lib/participantAuth';
import { isDemoMode } from '../lib/runtimeMode';

const PARTICIPANT_ROLES: ParticipantRole[] = ['Supplier', 'Buyer', 'Investor'];

interface AuthPageProps {
  onAuthenticated: () => void;
}

export default function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [searchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('you@company.com');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [entityName, setEntityName] = useState('');
  const [participantRole, setParticipantRole] = useState<ParticipantRole>('Supplier');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [detectedRole, setDetectedRole] = useState<ParticipantRole | undefined>();
  const [detectedOrgRole, setDetectedOrgRole] = useState<string | undefined>();
  const [detectedOrganizationName, setDetectedOrganizationName] = useState<string | undefined>();
  const [lastLookupEmail, setLastLookupEmail] = useState('');
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const invitationToken = searchParams.get('invite') ?? searchParams.get('token') ?? searchParams.get('invitation_token');

  const mapPartyTypeToParticipantRole = (value: unknown): ParticipantRole | undefined => {
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
  };

  const lookupRoleHintForEmail = async () => {
    if (isDemoMode() || authMode !== 'signin') {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || normalizedEmail === lastLookupEmail || isLookupLoading) {
      return;
    }

    setIsLookupLoading(true);
    setLastLookupEmail(normalizedEmail);

    try {
      const { data: hint } = await verityApi.getRoleHint(normalizedEmail);
      const hintRole =
        mapPartyTypeToParticipantRole(hint?.participantRole) ??
        (hint?.participantRole === 'Supplier' || hint?.participantRole === 'Buyer' || hint?.participantRole === 'Investor'
          ? hint.participantRole
          : undefined);

      setDetectedRole(hintRole);
      setDetectedOrgRole(typeof hint?.organizationRole === 'string' ? hint.organizationRole : undefined);
      setDetectedOrganizationName(typeof hint?.organizationName === 'string' ? hint.organizationName : undefined);
    } catch {
      setDetectedRole(undefined);
      setDetectedOrgRole(undefined);
      setDetectedOrganizationName(undefined);
    } finally {
      setIsLookupLoading(false);
    }
  };

  const acceptInvitationIfPresent = async (accessToken: string) => {
    if (!invitationToken) {
      return;
    }

    await verityApi.acceptInvitation({
      invitationToken,
      accessToken,
      fullName,
      legalName: entityName,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (isDemoMode()) {
        storeDemoAccess(email, {
          participantRole,
          entityName,
        });
        onAuthenticated();
        return;
      }

      if (authMode === 'register') {
        const partyType = participantRole.toUpperCase() as PartyType;
        const { data } = await verityApi.register({
          email,
          password,
          fullName,
          entityName,
          participantRole,
          partyType,
          invitationToken: invitationToken ?? undefined,
        });

        if (data?.session) {
          if (invitationToken) {
            await acceptInvitationIfPresent(data.session.accessToken);
          }

          storeApiSession(data.session, email, { participantRole, entityName });
          onAuthenticated();
          return;
        }

        setSuccessMessage(
          invitationToken
            ? 'Invitation registration submitted. Confirm your email, then sign in to activate membership.'
            : 'Registration submitted. Confirm your email, then sign in to continue.'
        );
        setAuthMode('signin');
        return;
      }

      const { data } = await verityApi.signIn({
        email,
        password,
      });

      if (!data?.session) {
        setErrorMessage('VerityAPI did not return a session for this account.');
        return;
      }

      if (invitationToken) {
        await acceptInvitationIfPresent(data.session.accessToken);
      }

      const metadata = data.session.user.userMetadata ?? {};
      const signedInRole =
        metadata.participantRole === 'Supplier' || metadata.participantRole === 'Buyer' || metadata.participantRole === 'Investor'
          ? metadata.participantRole
          : undefined;
      const signedInEntityName =
        typeof metadata.entityName === 'string'
          ? metadata.entityName
          : typeof metadata.organization_name === 'string'
            ? metadata.organization_name
            : undefined;

      storeApiSession(data.session, email, {
        participantRole: signedInRole,
        entityName: signedInEntityName,
      });
      onAuthenticated();
      return;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to authenticate through VerityAPI right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-[12px] shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="w-[40px] h-[40px] mx-auto bg-[#0052CC] rounded-[10px] flex items-center justify-center text-white mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
            {invitationToken
              ? authMode === 'signin'
                ? 'Accept Organization Invitation'
                : 'Register and Accept Invitation'
              : authMode === 'signin'
                ? 'Sign In to VerityUI'
                : 'Register Participant Access'}
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            {invitationToken
              ? 'Use the same onboarding model to confirm your account and activate the invited organization membership.'
              : authMode === 'signin'
                ? 'Authenticate before entering invoice workflows and treasury views.'
                : 'Create your participant identity and role for Verity protocol access.'}
          </p>
          {invitationToken && (
            <p className="mt-4 text-[11px] uppercase tracking-[0.2em] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-2">
              Invitation flow detected. Complete sign-in or registration to activate membership.
            </p>
          )}
          {isDemoMode() && (
            <p className="mt-4 text-[11px] uppercase tracking-[0.2em] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2">
              Demo mode active. Local demo data is being used.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setDetectedRole(undefined);
              setDetectedOrgRole(undefined);
              setDetectedOrganizationName(undefined);
              setLastLookupEmail('');
            }}
            className={`px-3 py-2 text-[10px] uppercase tracking-widest font-bold border ${
              authMode === 'signin'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setDetectedRole(undefined);
              setDetectedOrgRole(undefined);
              setDetectedOrganizationName(undefined);
              setLastLookupEmail('');
            }}
            className={`px-3 py-2 text-[10px] uppercase tracking-widest font-bold border ${
              authMode === 'register'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {(authMode === 'register' || invitationToken) && (
            <>
              <div>
                <label htmlFor="fullName" className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required={authMode === 'register'}
                  placeholder="Jordan Lee"
                  value={fullName}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFullName(event.target.value)}
                  className="w-full bg-white border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label htmlFor="entityName" className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-2">
                  {invitationToken ? 'Organization / Legal Name' : 'Entity Name'}
                </label>
                <input
                  id="entityName"
                  type="text"
                  required={authMode === 'register' && !invitationToken}
                  placeholder={invitationToken ? 'Apex Advanced Components Ltd' : 'Apex Advanced Components'}
                  value={entityName}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEntityName(event.target.value)}
                  className="w-full bg-white border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label htmlFor="participantRole" className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-2">
                  Participant Role
                </label>
                <select
                  id="participantRole"
                  value={participantRole}
                  onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setParticipantRole(event.target.value as ParticipantRole)}
                  className="w-full bg-white border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#0052CC]"
                >
                  {PARTICIPANT_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-2">
              Work Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(event.target.value);
                setDetectedRole(undefined);
                setDetectedOrgRole(undefined);
                setDetectedOrganizationName(undefined);
                setLastLookupEmail('');
              }}
              className="w-full bg-white border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#0052CC]"
            />
          </div>

          {authMode === 'signin' && !invitationToken && (detectedRole || isLookupLoading) && (
            <div className="text-xs text-sky-800 bg-sky-50 border border-sky-200 px-3 py-2 leading-relaxed">
              {isLookupLoading
                ? 'Checking saved role for this email...'
                : `Saved role: ${detectedRole ?? 'Unknown'}${
                    detectedOrgRole ? ` (${detectedOrgRole.replace('_', ' ')})` : ''
                  }${detectedOrganizationName ? ` at ${detectedOrganizationName}` : ''}`}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
              onFocus={() => {
                void lookupRoleHintForEmail();
              }}
              className="w-full bg-white border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#0052CC]"
            />
          </div>

          {errorMessage && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 leading-relaxed">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 leading-relaxed">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-[#0052CC] hover:bg-[#003D9B] disabled:bg-slate-500 text-xs text-white tracking-widest uppercase font-bold transition duration-200 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? authMode === 'signin'
                ? 'Signing In...'
                : 'Registering...'
              : authMode === 'signin'
                ? 'Continue to VerityUI'
                : 'Create Participant Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
