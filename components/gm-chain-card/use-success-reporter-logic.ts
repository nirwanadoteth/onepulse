import { useEffect, useRef } from "react";
import { useReducer } from "spacetimedb/react";
import { useReadDailyGmLastGmDay } from "@/helpers/contracts";
import type { ChainId } from "@/lib/constants";
import { handleError } from "@/lib/error-handling";
import { reducers } from "@/spacetimedb";
import type { TransactionStatus } from "@/types/transaction";

type UseSuccessReporterLogicProps = {
  status: TransactionStatus;
  address: `0x${string}`;
  chainId: ChainId;
  txHash?: string;
};

export const useSuccessReporterLogic = ({
  status,
  address,
  chainId,
  txHash,
}: UseSuccessReporterLogicProps) => {
  const didReport = useRef(false);

  const lastGmDay = useReadDailyGmLastGmDay({ chainId, args: [address] });

  const reportGm = useReducer(reducers.report);

  useEffect(() => {
    if (status !== "success" || !address || didReport.current) {
      return;
    }
    if (!lastGmDay.data) {
      handleError(
        new Error("Cannot report GM success without lastGmDay"),
        "GM reporting failed",
        {
          operation: "gm/reporting/missing-last-gm-day",
          address,
          chainId,
          txHash,
        },
        { silent: true }
      );
      return;
    }

    didReport.current = true;

    reportGm({ address, lastGmDay: lastGmDay.data });
  }, [status, address, lastGmDay.data, chainId, txHash, reportGm]);
};
