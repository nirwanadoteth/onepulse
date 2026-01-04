"use client";

import type { Address } from "viem/accounts";
import { Button } from "@/components/ui/button";
import { CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChainId } from "@/lib/constants";
import { GMTransaction } from "./gm-transaction";

type MainModeProps = {
  chainId: ChainId;
  contractAddress: Address;
  isSponsored: boolean;
  isContractReady: boolean;
  processing: boolean;
  chainBtnClasses: string;
  address: `0x${string}`;
  refetchLastGmDayAction?: () => Promise<unknown>;
  onCloseAction: () => void;
  setProcessingAction: (value: boolean) => void;
  onSwitchToGmToAction: () => void;
};

export function MainMode({
  chainId,
  contractAddress,
  isSponsored,
  isContractReady,
  processing,
  chainBtnClasses,
  address,
  refetchLastGmDayAction,
  onCloseAction,
  setProcessingAction,
  onSwitchToGmToAction,
}: MainModeProps) {
  return (
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
          onCloseAction={onCloseAction}
          processing={processing}
          refetchLastGmDayAction={refetchLastGmDayAction}
          setProcessingAction={setProcessingAction}
          transactionType="gm"
        />{" "}
        <Button
          aria-disabled={!isContractReady || processing}
          className={`w-full ${chainBtnClasses}`}
          disabled={!isContractReady || processing}
          onClick={onSwitchToGmToAction}
        >
          GM to a Fren
        </Button>
        <Button
          aria-disabled={processing}
          className="w-full"
          disabled={processing}
          onClick={onCloseAction}
          variant="outline"
        >
          Cancel
        </Button>
      </CardFooter>
    </>
  );
}
