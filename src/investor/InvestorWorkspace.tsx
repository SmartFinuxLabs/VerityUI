import React from 'react';
import SupplierWorkspace from '../supplier/SupplierWorkspace';

interface InvestorWorkspaceProps {
  accessLabel?: string;
  accessRole?: string;
  onResetAccess?: () => void;
}

export default function InvestorWorkspace({
  accessLabel,
  accessRole,
  onResetAccess,
}: InvestorWorkspaceProps) {
  return (
    <SupplierWorkspace
      initialRoute="factoring"
      accessLabel={accessLabel}
      accessRole={accessRole}
      onResetAccess={onResetAccess}
    />
  );
}
