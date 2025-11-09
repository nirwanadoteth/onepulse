"use client";

import { DisconnectWallet } from "@/components/wallet";

type DisconnectWalletSectionProps = {
  isConnected: boolean;
  showDisconnect: boolean;
  onTabChange: (tab: string) => void;
};

export function DisconnectWalletSection({
  isConnected,
  showDisconnect,
  onTabChange,
}: DisconnectWalletSectionProps) {
  if (!(isConnected && showDisconnect)) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 mx-auto w-[95%] max-w-lg p-4">
      <DisconnectWallet onDisconnected={() => onTabChange("home")} />
    </div>
  );
}
