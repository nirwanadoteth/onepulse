"use client";

import { ConnectWallet as ConnectWalletButton } from "@coinbase/onchainkit/wallet";
import { cn } from "@/lib/utils";

export function ConnectWallet({ className }: { className?: string }) {
  return (
    <div className="mx-auto w-full">
      <ConnectWalletButton
        className={cn(
          "size-lg w-full bg-[#0052ff] text-white hover:bg-[#0052ff]/90",
          className
        )}
        disconnectedLabel="Log In"
      />
    </div>
  );
}
