"use client";

import { memo } from "react";
import type { Address } from "viem";
import { Button } from "@/components/ui/button";
import { CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GMTransaction } from "./gm-transaction";

type MainModeProps = {
  chainId: number;
  contractAddress: Address;
  isSponsored: boolean;
  isContractReady: boolean;
  processing: boolean;
  chainBtnClasses: string;
  address?: string;
  refetchLastGmDay?: () => Promise<unknown>;
  onClose: () => void;
  setProcessing: (value: boolean) => void;
  onSwitchToGmTo: () => void;
};

export const MainMode = memo(
  ({
    chainId,
    contractAddress,
    isSponsored,
    isContractReady,
    processing,
    chainBtnClasses,
    address,
    refetchLastGmDay,
    onClose,
    setProcessing,
    onSwitchToGmTo,
  }: MainModeProps) => (
    <>
      <CardHeader>
        <CardTitle
          className="text-center text-lg"
          id={`gm-dialog-title-${chainId}`}
        >
          Choose GM Type
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col gap-2">
        <GMTransaction
          address={address}
          buttonLabel="GM"
          chainBtnClasses={chainBtnClasses}
          chainId={chainId}
          contractAddress={contractAddress}
          isContractReady={isContractReady}
          isSponsored={isSponsored}
          onClose={onClose}
          processing={processing}
          refetchLastGmDay={refetchLastGmDay}
          setProcessing={setProcessing}
          transactionType="gm"
        />{" "}
        <Button
          aria-disabled={!isContractReady || processing}
          className={`w-full ${chainBtnClasses}`}
          disabled={!isContractReady || processing}
          onClick={onSwitchToGmTo}
        >
          GM to a Fren
        </Button>
        <Button
          aria-disabled={processing}
          className="w-full"
          disabled={processing}
          onClick={onClose}
          variant="outline"
        >
          Cancel
        </Button>
      </CardFooter>
    </>
  )
);
