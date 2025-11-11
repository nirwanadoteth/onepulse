"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRewardVaultStatus } from "@/hooks/use-degen-claim";
import { Icons } from "./icons";

export function VaultBalanceCard() {
  const { available, isPending } = useRewardVaultStatus();

  const formatBalance = (value: bigint) =>
    (Number(value) / 1e18).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="font-semibold text-lg">Vault Balance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPending ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-4 w-4 animate-spin rounded-full border border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full">
                <Icons.degen className="h-9 w-9" />
              </div>
              <div className="text-center">
                <div className="font-medium text-3xl">
                  {formatBalance(available)}
                  <span className="ml-2 text-[#a36efd]">DEGEN</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
