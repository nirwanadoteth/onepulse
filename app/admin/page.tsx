"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import { AdminConnectWallet } from "@/components/admin/admin-connect-wallet";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { useContractOwner } from "@/hooks/use-contract-owner";

export default function AdminPage() {
  const { address, isConnected } = useAppKitAccount({ namespace: "eip155" });
  const { owner, isLoading } = useContractOwner();

  if (!isConnected) {
    return <AdminConnectWallet />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const isOwner = address?.toLowerCase() === owner?.toLowerCase();

  if (!isOwner) {
    return <AdminAccessDenied address={address} owner={owner} />;
  }

  return <AdminDashboard />;
}
