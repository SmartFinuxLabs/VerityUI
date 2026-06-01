import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { ParticipantRole, storeDemoAccess, storeSupabaseSession } from '../lib/participantAuth';
import { hasSupabaseConfig, supabase } from '../lib/supabaseClient';

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
    if (!supabase || authMode !== 'signin') {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || normalizedEmail === lastLookupEmail || isLookupLoading) {
      return;
    }

    setIsLookupLoading(true);
    setLastLookupEmail(normalizedEmail);

    try {
      const { data, error } = await supabase.rpc('get_signin_role_hint', {
        p_email: normalizedEmail,
      });

      if (error) {
        setDetectedRole(undefined);
        setDetectedOrgRole(undefined);
        setDetectedOrganizationName(undefined);
        return;
      }

      const hint = Array.isArray(data) ? data[0] : undefined;
      const hintRole =
        mapPartyTypeToParticipantRole(hint?.participant_role) ??
        (hint?.participant_role === 'Supplier' || hint?.participant_role === 'Buyer' || hint?.participant_role === 'Investor'
          ? hint.participant_role
          : undefined);

      setDetectedRole(hintRole);
      setDetectedOrgRole(typeof hint?.organization_role === 'string' ? hint.organization_role : undefined);
      setDetectedOrganizationName(typeof hint?.organization_name === 'string' ? hint.organization_name : undefined);
    } finally {
      setIsLookupLoading(false);
    }
  };

  const acceptInvitationIfPresent = async (session: Session) => {
    if (!invitationToken || !supabase) {
      return;
    }

    const { error } = await supabase.rpc('accept_organization_invitation', {
      p_invitation_token: invitationToken,
      p_user_id: session.user.id,
      p_full_name: fullName || session.user.user_metadata?.full_name || session.user.user_metadata?.display_name || null,
      p_legal_name: entityName || null,
      p_registration_no: null,
      p_risk_profile: {},
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (supabase) {
        if (authMode === 'register') {
          const partyType = participantRole.toUpperCase() as 'SUPPLIER' | 'BUYER' | 'INVESTOR';
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                provision_organization: !invitationToken,
                party_type: partyType,
                participantRole,
                organization_name: entityName,
                entityName,
                full_name: fullName,
                display_name: fullName,
              },
            },
          });

          if (error) {
            setErrorMessage(error.message);
            return;
          }

          if (data.session) {
            if (invitationToken) {
              await acceptInvitationIfPresent(data.session);
            }

            storeSupabaseSession(data.session, email, { participantRole, entityName });
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

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        if (!data.session) {
          setErrorMessage('Supabase did not return a session for this account.');
          return;
        }

        if (invitationToken) {
          await acceptInvitationIfPresent(data.session);
        }

        const metadata = data.session.user.user_metadata ?? {};
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

        storeSupabaseSession(data.session, email, {
          participantRole: signedInRole,
          entityName: signedInEntityName,
        });
        onAuthenticated();
        return;
      }

      storeDemoAccess(email, {
        participantRole,
        entityName,
      });
      onAuthenticated();
    } catch {
      setErrorMessage('Unable to authenticate right now. Check network or Supabase settings.');
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
          {!hasSupabaseConfig() && (
            <p className="mt-4 text-[11px] uppercase tracking-[0.2em] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2">
              Demo auth active. Configure Supabase keys for real registration.
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