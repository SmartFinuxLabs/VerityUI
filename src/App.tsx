import React, { useState } from 'react';
import { MainRoute } from './types';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import BuyerWorkspace from './buyer/BuyerWorkspace';
import SupplierWorkspace from './supplier/SupplierWorkspace';
import InvestorWorkspace from './investor/InvestorWorkspace';
import { ParticipantRole, clearParticipantAccess, getParticipantAccessSnapshot, hasParticipantAccess } from './lib/participantAuth';

function getFirstRouteForRole(role?: ParticipantRole) {
  // Phase 1 role-routing baseline.
  if (role === 'Supplier') {
    return 'supplier-workspace' as MainRoute;
  }

  if (role === 'Buyer') {
    return 'buyer-workspace' as MainRoute;
  }

  if (role === 'Investor') {
    return 'investor-workspace' as MainRoute;
  }

  return 'supplier-workspace' as MainRoute;
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<MainRoute>('landing');

  const accessSnapshot = getParticipantAccessSnapshot();

  const handleStartApp = () => {
    if (hasParticipantAccess()) {
      setCurrentRoute(getFirstRouteForRole(accessSnapshot?.participantRole));
      return;
    }

    setCurrentRoute('auth');
  };

  const handleAuthenticated = () => {
    const snapshot = getParticipantAccessSnapshot();
    setCurrentRoute(getFirstRouteForRole(snapshot?.participantRole));
  };

  const handleResetAccess = () => {
    clearParticipantAccess();
    setCurrentRoute('auth');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans select-none antialiased">
      
      {currentRoute === 'landing' ? (
        
        // Render Screen 1: Marketing Landing Page
        <LandingPage onStartApp={handleStartApp} />

      ) : currentRoute === 'auth' ? (

        <AuthPage onAuthenticated={handleAuthenticated} />

      ) : currentRoute === 'supplier-workspace' ? (

        <SupplierWorkspace
          accessLabel={accessSnapshot ? `${accessSnapshot.provider === 'supabase' ? 'Supabase Auth' : 'Demo Access'} · ${accessSnapshot.email}` : undefined}
          accessRole={accessSnapshot?.participantRole}
          onResetAccess={accessSnapshot ? handleResetAccess : undefined}
        />

      ) : currentRoute === 'buyer-workspace' ? (

        <BuyerWorkspace />

      ) : currentRoute === 'investor-workspace' ? (

        <InvestorWorkspace
          accessLabel={accessSnapshot ? `${accessSnapshot.provider === 'supabase' ? 'Supabase Auth' : 'Demo Access'} · ${accessSnapshot.email}` : undefined}
          accessRole={accessSnapshot?.participantRole}
          onResetAccess={accessSnapshot ? handleResetAccess : undefined}
        />

      ) : (

        <AuthPage onAuthenticated={handleAuthenticated} />
      )}

    </div>
  );
}
