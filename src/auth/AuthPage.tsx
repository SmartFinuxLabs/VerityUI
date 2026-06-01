import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { ParticipantRole, storeDemoAccess, storeSupabaseSession } from '../lib/participantAuth';
import { hasSupabaseConfig, supabase } from '../lib/supabaseClient';

const PARTICIPANT_ROLES: ParticipantRole[] = ['Supplier', 'Buyer', 'Investor'];

interface AuthPageProps {
  onAuthenticated: () => void;
}

export default function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('you@company.com');
  const [password, setPassword] = useState('');
  const [entityName, setEntityName] = useState('');
  const [participantRole, setParticipantRole] = useState<ParticipantRole>('Supplier');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (supabase) {
        if (authMode === 'register') {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                participantRole,
                entityName,
              },
            },
          });

          if (error) {
            setErrorMessage(error.message);
            return;
          }

          if (data.session) {
            storeSupabaseSession(data.session, email, { participantRole, entityName });
            onAuthenticated();
            return;
          }

          setSuccessMessage('Registration submitted. Confirm your email, then sign in to continue.');
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

        const metadata = data.session.user.user_metadata ?? {};
        const signedInRole =
          metadata.participantRole === 'Supplier' || metadata.participantRole === 'Buyer' || metadata.participantRole === 'Investor'
            ? metadata.participantRole
            : undefined;
        const signedInEntityName = typeof metadata.entityName === 'string' ? metadata.entityName : undefined;

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
            {authMode === 'signin' ? 'Sign In to VerityUI' : 'Register Participant Access'}
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            {authMode === 'signin'
              ? 'Authenticate before entering invoice workflows and treasury views.'
              : 'Create your participant identity and role for Verity protocol access.'}
          </p>
          {!hasSupabaseConfig() && (
            <p className="mt-4 text-[11px] uppercase tracking-[0.2em] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2">
              Demo auth active. Configure Supabase keys for real registration.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            type="button"
            onClick={() => setAuthMode('signin')}
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
            onClick={() => setAuthMode('register')}
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
          {authMode === 'register' && (
            <>
              <div>
                <label htmlFor="entityName" className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-2">
                  Entity Name
                </label>
                <input
                  id="entityName"
                  type="text"
                  required
                  placeholder="Apex Advanced Components"
                  value={entityName}
                  onChange={(event) => setEntityName(event.target.value)}
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
                  onChange={(event) => setParticipantRole(event.target.value as ParticipantRole)}
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
              onChange={(event) => setEmail(event.target.value)}
              className="w-full bg-white border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#0052CC]"
            />
          </div>

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
              onChange={(event) => setPassword(event.target.value)}
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