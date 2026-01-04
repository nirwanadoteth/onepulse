"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { encodeFunctionData, TransactionExecutionError, type Address, type Capabilities, type ContractFunctionParameters, type Hex, type TransactionReceipt } from "viem";
import { useCapabilities, useConfig, useConnection, useSwitchChain, useWaitForTransactionReceipt, type Config, useCallsStatus as useCallsStatusWagmi, useSendTransaction, useChainId } from 'wagmi';
import { useSendCalls as useSendCallsWagmi } from "wagmi";
import type { SendTransactionMutateAsync } from "wagmi/query";
import { waitForTransactionReceipt } from '@wagmi/core/actions';
import { base } from "@wagmi/core/chains";
import { cn, getChainExplorer } from "@/lib/utils";
import { Spinner } from "./spinner";

export const getPaymasterUrl = (
  capabilities?: Capabilities,
): string | null => {
  return capabilities?.paymasterService?.url || null;
};

export function useValue<T>(object: T): T {
  return object;
}

export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';
// Most likely EOAexport const genericErrorMessage = 'Something went wrong. Please try again.';
export const METHOD_NOT_SUPPORTED_ERROR_SUBSTRING =
  'this request method is not supported';
export const SEND_CALLS_NOT_SUPPORTED_ERROR = 'SEND_CALLS_NOT_SUPPORTED_ERROR';
export const TRANSACTION_TYPE_CALLS = 'TRANSACTION_TYPE_CALLS';
export const TRANSACTION_TYPE_CONTRACTS = 'TRANSACTION_TYPE_CONTRACTS';

/**
 * Note: exported as public Type
 */
export type APIError = {
  /** The Error code */
  code: string;
  /** The Error long message */
  error: string;
  /** The Error short message */
  message: string;
};

/**
 * Note: exported as public Type
 */
export type TransactionError = APIError;

export type Call = { to: Hex; data?: Hex; value?: bigint };

type TransactionButtonOverride = {
  text?: ReactNode;
  onClick?: (receipt?: TransactionReceipt) => void;
};

/**
 * List of transaction lifecycle statuses.
 * The order of the statuses loosely follows the transaction lifecycle.
 *
 * Note: exported as public Type
 */
export type LifecycleStatus =
  | {
      statusName: 'init';
      statusData: null;
    }
  | {
      statusName: 'error';
      statusData: TransactionError;
    }
  | {
      statusName: 'transactionIdle'; // initial status prior to the mutation function executing
      statusData: null;
    }
  | {
      statusName: 'buildingTransaction';
      statusData: null;
    }
  | {
      statusName: 'transactionPending'; // if the mutation is currently executing
      statusData: null;
    }
  | {
      statusName: 'transactionLegacyExecuted';
      statusData: {
        transactionHashList: Address[];
      };
    }
  | {
      statusName: 'success'; // if the last mutation attempt was successful
      statusData: {
        transactionReceipts: TransactionReceipt[];
      };
    }
  | {
      statusName: 'reset';
      statusData: null;
    };

export type IsSpinnerDisplayedProps = {
  errorMessage?: string;
  hasReceipt?: boolean;
  isInProgress?: boolean;
  transactionHash?: string;
  transactionId?: string;
};

type TransactionButtonState = 'default' | 'success' | 'error' | 'pending';

export type TransactionButtonRenderParams = {
  /** The current state of the button */
  status: TransactionButtonState;
  /** The function to be called when the button is clicked */
  onSubmit: () => void;
  /** The function to be called when the button is clicked */
  onSuccess: () => void;
  /** Whether the button is disabled */
  isDisabled: boolean;
  /** The context of the transaction */
  context: TransactionContextType;
};

/**
 * Note: exported as public Type
 */
export type TransactionButtonProps = {
  /** An optional CSS class name for styling the button component */
  className?: string;
  /** A optional prop to disable the submit button */
  disabled?: boolean;
  /** An optional text to be displayed in the button component */
  text?: ReactNode;
  /** Optional overrides for text and onClick handler in error state (default is resubmit txn) */
  errorOverride?: TransactionButtonOverride;
  /** Optional overrides for text and onClick handler in success state (default is view txn on block explorer) */
  successOverride?: TransactionButtonOverride;
  /** Optional overrides for text in pending state (default is loading spinner) */
  pendingOverride?: Pick<TransactionButtonOverride, 'text'>;
  /** Optional render prop to customize the button content */
  renderAction?: (params: TransactionButtonRenderParams) => ReactNode;
};

export type TransactionContextType = {
  /** The chainId for the transaction */
  chainId?: number;
  /** An error code used to localize errors and provide more context with unit-tests */
  errorCode?: string;
  /** An error message string if the transaction encounters an issue */
  errorMessage?: string;
  /** A boolean indicating if the transaction is currently loading */
  isLoading: boolean;
  /** A boolean indicating if the transaction toast notification is visible */
  isToastVisible: boolean;
  /** A function called when the transaction is submitted */
  onSubmit: () => void;
  /** The paymaster URL for the transaction */
  paymasterUrl: string | null;
  /** The receipt of the transaction */
  receipt?: TransactionReceipt;
  /** The lifecycle status of the transaction */
  lifecycleStatus: LifecycleStatus;
  /** A function to set the visibility of the transaction toast */
  setIsToastVisible: (isVisible: boolean) => void;
  /** A function to set the lifecycle status of the component */
  setLifecycleStatus: (state: LifecycleStatus) => void;
  /** A function to set the transaction ID */
  setTransactionId: (id: string) => void;
  /** An array of transactions for the component or a promise that resolves to an array of transactions */
  transactions?: Calls | Contracts | Array<Call | ContractFunctionParameters>;
  /** An optional string representing the ID of the transaction */
  transactionId?: string;
  /** An optional string representing the hash of the transaction */
  transactionHash?: string;
  /** Number of transactions being executed */
  transactionCount?: number;
};

type PaymasterService = {
  url: string;
};

export type SendBatchedTransactionsParams = {
  capabilities?: WalletCapabilities;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  sendCallsAsync: any;
  transactions?: Array<Call | ContractFunctionParameters>;
};

export type SendSingleTransactionParams = {
  config: Config;
  sendCallAsync: SendTransactionMutateAsync<Config, unknown> | (() => void);
  transactions: Array<Call | ContractFunctionParameters>;
};

export type Calls = Call[] | Promise<Call[]> | (() => Promise<Call[]>);
export type Contracts =
  | ContractFunctionParameters[]
  | Promise<ContractFunctionParameters[]>
  | (() => Promise<ContractFunctionParameters[]>);

export type TransactionProviderProps = {
  /** An array of calls to be made in the transaction */
  calls?: Calls | Contracts | Array<Call | ContractFunctionParameters>;
  /**
   * @deprecated Use `isSponsored` instead.
   */
  capabilities?: WalletCapabilities;
  /** The chainId for the transaction */
  chainId: number;
  /** The child components to be rendered within the provider component */
  children: ReactNode;
  /** Whether the transactions are sponsored (default: false) */
  isSponsored?: boolean;
  /** An optional callback function that handles errors within the provider */
  onError?: (e: TransactionError) => void;
  /** An optional callback function that exposes the component lifecycle state */
  onStatus?: (lifecycleStatus: LifecycleStatus) => void;
  /** An optional callback function that exposes the transaction receipts */
  onSuccess?: (response: TransactionResponseType) => void;
  /** An optional time (in ms) after which to reset the component */
  resetAfter?: number;
};

/**
 * Note: exported as public Type
 */
export type TransactionProps = {
  /** An array of calls to be made in the transaction */
  calls?: Calls | Contracts | Array<Call | ContractFunctionParameters>;
  /**
   * @deprecated Use `isSponsored` instead.
   */
  capabilities?: WalletCapabilities;
  /** The chainId for the transaction */
  chainId?: number;
  /** The child components to be rendered within the transaction component */
  children?: ReactNode;
  /** An optional CSS class name for styling the component */
  className?: string;
  /** Whether the transactions are sponsored (default: false) */
  isSponsored?: boolean;
  /** An optional callback function that handles transaction errors */
  onError?: (e: TransactionError) => void;
  /** An optional callback function that exposes the component lifecycle state */
  onStatus?: (lifecycleStatus: LifecycleStatus) => void;
  /** An optional callback function that exposes the transaction receipts */
  onSuccess?: (response: TransactionResponseType) => void;
  /** An optional time (in ms) after which to reset the component */
  resetAfter?: number;
} & (
  | {
      children: ReactNode;
      /** An optional prop to disable submit button. Only available when children are not provided. */
      disabled?: never;
    }
  | {
      children?: never;
      /** An optional prop to disable submit button. Only available when children are not provided. */
      disabled?: boolean;
    }
);

/**
 * Note: exported as public Type
 */
export type TransactionResponseType = {
  transactionReceipts: TransactionReceipt[];
};

export type UseCallsStatusParams = {
  setLifecycleStatusAction: (state: LifecycleStatus) => void;
  transactionId: string;
};

export type UseWriteContractParams = {
  setLifecycleStatusAction: (state: LifecycleStatus) => void;
  transactionHashList: Address[];
};

export type UseSendCallParams = {
  setLifecycleStatusAction: (state: LifecycleStatus) => void;
  transactionHashList: Address[];
};

export type UseSendCallsParams = {
  setLifecycleStatusAction: (state: LifecycleStatus) => void;
  setTransactionIdAction: (id: string) => void;
};

export type UseSendWalletTransactionsParams = {
  capabilities?: WalletCapabilities;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  sendCallsAsync: any;
  sendCallAsync: SendTransactionMutateAsync<Config, unknown> | (() => void);
  walletCapabilities: Capabilities;
};

/**
 * Note: exported as public Type
 *
 * Wallet capabilities configuration
 */
export type WalletCapabilities = {
  paymasterService?: PaymasterService;
};

export type UseCapabilitiesSafeParams = {
  /** Chain ID for the network */
  chainId: number;
};

const emptyContext = {} as TransactionContextType;
export const TransactionContext =
  createContext<TransactionContextType>(emptyContext);

export function useTransactionContext() {
  const context = useContext(TransactionContext);
  if (context === emptyContext) {
    throw new Error(
      'useTransactionContext must be used within a Transaction component',
    );
  }
  return context;
}

export function isUserRejectedRequestError(err: unknown) {
  if (
    (err as TransactionExecutionError)?.cause?.name ===
    'UserRejectedRequestError'
  ) {
    return true;
  }
  if (
    (err as TransactionExecutionError)?.shortMessage?.includes(
      'User rejected the request.',
    )
  ) {
    return true;
  }
  return false;
}

export function useCapabilitiesSafe({
  chainId,
}: UseCapabilitiesSafeParams): Capabilities {
  const { isConnected } = useConnection();

  const { data: capabilities, error } = useCapabilities({
    query: { enabled: isConnected },
  });

  return (() => {
    if (error || !capabilities || !capabilities[chainId]) {
      return {};
    }

    return capabilities[chainId];
  })();
}

export function isContract(
  transaction: Call | ContractFunctionParameters,
): transaction is ContractFunctionParameters {
  return 'abi' in transaction;
}

export const sendBatchedTransactions = async ({
  capabilities,
  sendCallsAsync,
  transactions,
}: SendBatchedTransactionsParams) => {
  if (!transactions) {
    return;
  }

  const calls = transactions?.map((transaction) => {
    if (isContract(transaction)) {
      const { address, ...rest } = transaction;
      return {
        ...rest,
        to: address,
      };
    }
    return transaction;
  });

  await sendCallsAsync({
    calls,
    capabilities,
  });
};

export const sendSingleTransactions = async ({
  config,
  sendCallAsync,
  transactions,
}: SendSingleTransactionParams) => {
  const calls = transactions?.map((transaction) => {
    if (isContract(transaction)) {
      return {
        data: encodeFunctionData({
          abi: transaction?.abi,
          functionName: transaction?.functionName,
          args: transaction?.args,
        }),
        to: transaction?.address,
      };
    }
    return transaction;
  });

  for (const call of calls) {
    const txHash = await sendCallAsync(call);
    if (txHash) {
      await waitForTransactionReceipt(config, {
        hash: txHash,
        confirmations: 1,
      });
    }
  }
};

export const useSendWalletTransactions = ({
  capabilities,
  sendCallAsync,
  sendCallsAsync,
  walletCapabilities,
}: UseSendWalletTransactionsParams) => {
  const config = useConfig();
  return async (
    transactions?:
      | Call[]
      | ContractFunctionParameters[]
      | Promise<Call[]>
      | Promise<ContractFunctionParameters[]>
      | Array<Call | ContractFunctionParameters>,
  ) => {
    if (!transactions) {
      return;
    }

    const resolvedTransactions = await Promise.resolve(transactions);

    if (walletCapabilities["atomicBatch"]?.supported) {
      // Batched transactions
      await sendBatchedTransactions({
        capabilities,
        sendCallsAsync,
        transactions: resolvedTransactions,
      });
    } else {
      // Non-batched transactions
      await sendSingleTransactions({
        config,
        sendCallAsync,
        transactions: resolvedTransactions,
      });
    }
  };
};

export function normalizeStatus(status?: string) {
  if (status === 'CONFIRMED') {
    return 'success';
  }
  if (status === 'PENDING') {
    return 'pending';
  }

  return status;
}

export function normalizeTransactionId(data: { id: string } | string) {
  if (typeof data === 'string') {
    return data;
  }
  return data.id;
}

export function useCallsStatus({
  setLifecycleStatusAction,
  transactionId,
}: UseCallsStatusParams) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useCallsStatusWagmi({
      id: transactionId,
      query: {
        refetchInterval: (query) => {
          return normalizeStatus(query.state.data?.status) === 'success'
            ? false
            : 1000;
        },
        enabled: !!transactionId,
      },
    });
    const transactionHash = data?.receipts?.[0]?.transactionHash;
    return { status: data?.status, transactionHash };
  } catch (err) {
    setLifecycleStatusAction({
      statusName: 'error',
      statusData: {
        code: 'TmUCSh01',
        error: JSON.stringify(err),
        message: '',
      },
    });
    return { status: 'error', transactionHash: undefined };
  }
}

export function useSendCall({
  setLifecycleStatusAction,
  transactionHashList,
}: UseSendCallParams) {
  const sendTransaction = useSendTransaction({
    mutation: {
      onError: (e) => {
        const errorMessage = isUserRejectedRequestError(e)
          ? 'Request denied.'
          : GENERIC_ERROR_MESSAGE;
        setLifecycleStatusAction({
          statusName: 'error',
          statusData: {
            code: 'TmUSCh01', // Transaction module UseSendCall hook 01 error
            error: e.message,
            message: errorMessage,
          },
        });
      },
      onSuccess: (hash: Address) => {
        setLifecycleStatusAction({
          statusName: 'transactionLegacyExecuted',
          statusData: {
            transactionHashList: [...transactionHashList, hash],
          },
        });
      },
    },
  });
  const sendCallAsync = sendTransaction.mutateAsync;
  const status = sendTransaction.status;
  const data = sendTransaction.data;
  const reset = sendTransaction.reset;
  return { status, sendCallAsync, data, reset };
}

export function useSendCalls({
  setLifecycleStatusAction,
  setTransactionIdAction,
}: UseSendCallsParams) {
  const sendCalls = useSendCallsWagmi({
    mutation: {
      onError: (e) => {
        const errorMessage = isUserRejectedRequestError(e)
          ? 'Request denied.'
          : GENERIC_ERROR_MESSAGE;
        setLifecycleStatusAction({
          statusName: 'error',
          statusData: {
            code: 'TmUSCSh01', // Transaction module UseSendCalls hook 01 error
            error: e.message,
            message: errorMessage,
          },
        });
      },
      onSuccess: (data) => {
        setTransactionIdAction(normalizeTransactionId(data));
      },
    },
  });
  const sendCallsAsync = sendCalls.mutateAsync;
    const status = sendCalls.status;
    const data = sendCalls.data;
    const reset = sendCalls.reset;
  return { status, sendCallsAsync, data, reset };
}

// TransactionProvider component (replicating OnchainKit's internal provider)
function TransactionProvider({
  calls,
  chainId,
  children,
  isSponsored,
  onError,
  onStatus,
  onSuccess,
  resetAfter,
}: {
  calls?: Calls | Contracts | Array<Call | ContractFunctionParameters>;
  chainId: number;
  children: ReactNode;
  isSponsored?: boolean;
  onError?: (e: TransactionError) => void;
  onStatus?: (lifecycleStatus: LifecycleStatus) => void;
  onSuccess?: (response: TransactionResponseType) => void;
  resetAfter?: number;
}) {
  const account = useConnection();
  const config = useConfig();
  const switchChainAsync = useSwitchChain();

  const paymaster = process.env.NEXT_PUBLIC_PAYMASTER_URL;

  const [errorMessage, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [lifecycleStatus, setLifecycleStatus] = useState<LifecycleStatus>({
    statusName: 'init',
    statusData: null,
  }); // Component lifecycle
  const [transactionId, setTransactionId] = useState('');
  const [transactionCount, setTransactionCount] = useState<
    number | undefined
  >();
  const [transactionHashList, setTransactionHashList] = useState<Address[]>([]);

  // Retrieve wallet capabilities
  const walletCapabilities = useCapabilitiesSafe({
    chainId,
  });

  // Validate `calls` and `contracts` props
  if (!calls) {
    throw new Error(
      'Transaction: calls must be provided as a prop to the Transaction component.',
    );
  }

  // useSendCalls or useSendCall
  // Used for contract calls with raw calldata.
  const {
    status: statusSendCalls,
    sendCallsAsync,
    reset: resetSendCalls,
  } = useSendCalls({
    setLifecycleStatusAction: setLifecycleStatus,
    setTransactionIdAction: setTransactionId,
  });

  const {
    status: statusSendCall,
    sendCallAsync,
    data: singleTransactionHash,
    reset: resetSendCall,
  } = useSendCall({
    setLifecycleStatusAction: setLifecycleStatus,
    transactionHashList,
  });

  // Transaction Status
  // For batched, use statusSendCalls
  // For single, use statusSendCall
  const transactionStatus = (() => {
    if (walletCapabilities["atomicBatch"]?.supported) {
      return statusSendCalls;
    }
    return statusSendCall;
  })();

  const capabilities = (() => {
    if (isSponsored && paymaster) {
      return {
        paymasterService: { url: paymaster },
        // this needs to be below so devs can override default paymaster
        // with their personal paymaster in production playgroundd
      };
    }
  })();

  // useSendWalletTransactions
  // Used to send transactions based on the transaction type. Can be of type calls or contracts.
  const sendWalletTransactions = useSendWalletTransactions({
    capabilities,
    sendCallAsync,
    sendCallsAsync,
    walletCapabilities,
  });

  const { transactionHash: batchedTransactionHash, status: callStatus } =
    useCallsStatus({
      setLifecycleStatusAction: setLifecycleStatus,
      transactionId,
    });

  const { data: receipt } = useWaitForTransactionReceipt({
    hash: singleTransactionHash || batchedTransactionHash,
  });

  // Component lifecycle emitters
  useEffect(() => {
    setErrorMessage('');
    // Error
    if (lifecycleStatus.statusName === 'error') {
      setErrorMessage(lifecycleStatus.statusData.message);
      setErrorCode(lifecycleStatus.statusData.code);
      onError?.(lifecycleStatus.statusData);
    }
    // Transaction Legacy Executed
    if (lifecycleStatus.statusName === 'transactionLegacyExecuted') {
      setTransactionHashList(lifecycleStatus.statusData.transactionHashList);
    }
    // Success
    if (lifecycleStatus.statusName === 'success') {
      onSuccess?.({
        transactionReceipts: lifecycleStatus.statusData.transactionReceipts,
      });
    }
    // Emit Status
    onStatus?.(lifecycleStatus);
  }, [
    onError,
    onStatus,
    onSuccess,
    lifecycleStatus,
    lifecycleStatus.statusData, // Keep statusData, so that the effect runs when it changes
    lifecycleStatus.statusName, // Keep statusName, so that the effect runs when it changes
  ]);

  // Set transaction pending status when writeContracts or writeContract is pending
  useEffect(() => {
    if (transactionStatus === 'pending') {
      setLifecycleStatus({
        statusName: 'transactionPending',
        statusData: null,
      });
    }
  }, [transactionStatus]);

  // Trigger success status when receipt is generated by useWaitForTransactionReceipt
  useEffect(() => {
    if (!receipt) {
      return;
    }
    setLifecycleStatus({
      statusName: 'success',
      statusData: {
        transactionReceipts: [receipt],
      },
    });
    if (resetAfter) {
      // Reset all internal state
      const timeoutId = setTimeout(() => {
        setErrorMessage('');
        setErrorCode('');
        setIsToastVisible(false);
        setTransactionId('');
        setTransactionHashList([]);
        setTransactionCount(undefined);
        resetSendCalls();
        resetSendCall();
      }, resetAfter);

      return () => clearTimeout(timeoutId);
    }
  }, [receipt, resetAfter, resetSendCalls, resetSendCall]);

  const getTransactionLegacyReceipts = async () => {
    const receipts = [];
    for (const hash of transactionHashList) {
      try {
        const txnReceipt = await waitForTransactionReceipt(config, {
          hash,
          chainId,
        });
        receipts.push(txnReceipt);
      } catch (err) {
        console.error(err);

        setLifecycleStatus({
          statusName: 'error',
          statusData: {
            code: 'TmTPc01', // Transaction module TransactionProvider component 01 error
            error: JSON.stringify(err),
            message: GENERIC_ERROR_MESSAGE,
          },
        });
        return;
      }
    }
    setLifecycleStatus({
      statusName: 'success',
      statusData: {
        transactionReceipts: receipts,
      },
    });
  };

  // When all transactions are successful, get the receipts
  useEffect(() => {
    if (
      !calls ||
      transactionHashList.length !== transactionCount ||
      transactionCount < 2
    ) {
      return;
    }
    getTransactionLegacyReceipts();
  }, [
    calls,
    transactionCount,
    transactionHashList,
    getTransactionLegacyReceipts,
  ]);

  const switchChain = async (targetChainId: number | undefined) => {
    if (targetChainId && account.chainId !== targetChainId) {
      await switchChainAsync.mutateAsync({ chainId: targetChainId });
    }
  };

  const buildTransaction = async () => {
    setLifecycleStatus({
      statusName: 'buildingTransaction',
      statusData: null,
    });
    try {
      const resolvedTransactions = await (typeof calls === 'function'
        ? calls()
        : Promise.resolve(calls));
      setTransactionCount(resolvedTransactions?.length);
      return resolvedTransactions;
    } catch (err) {
      setLifecycleStatus({
        statusName: 'error',
        statusData: {
          code: 'TmTPc04', // Transaction module TransactionProvider component 04 error
          error: JSON.stringify(err),
          message: 'Error building transactions',
        },
      });
      return undefined;
    }
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    setIsToastVisible(true);
    try {
      // Switch chain before attempting transactions
      await switchChain(chainId);
      const resolvedTransactions = await buildTransaction();
      await sendWalletTransactions(resolvedTransactions);
    } catch (err) {
      const errorMessage = isUserRejectedRequestError(err)
        ? 'Request denied.'
        : GENERIC_ERROR_MESSAGE;
      setLifecycleStatus({
        statusName: 'error',
        statusData: {
          code: 'TmTPc03', // Transaction module TransactionProvider component 03 error
          error: JSON.stringify(err),
          message: errorMessage,
        },
      });
    }
  };

  const isLoading =
    callStatus === "pending" ||
    lifecycleStatus.statusName === 'buildingTransaction' ||
    lifecycleStatus.statusName === 'transactionPending' ||
    (lifecycleStatus.statusName === 'transactionLegacyExecuted' &&
      transactionCount !==
        lifecycleStatus?.statusData?.transactionHashList?.length) ||
    ((!!transactionId || !!singleTransactionHash || !!batchedTransactionHash) &&
      !receipt);

  const value = useValue({
    chainId,
    errorCode,
    errorMessage,
    isLoading,
    isToastVisible,
    lifecycleStatus,
    onSubmit: handleSubmit,
    paymasterUrl: getPaymasterUrl(capabilities),
    receipt,
    setIsToastVisible,
    setLifecycleStatus,
    setTransactionId,
    transactions: calls,
    transactionId,
    transactionHash: singleTransactionHash || batchedTransactionHash,
    transactionCount,
  });

  useEffect(() => {
      if (!receipt) {
        return;
      }
    }, [
      receipt,
    ]);

    return (
      <TransactionContext value={value}>
        {children}
      </TransactionContext>
    );
}

export function TransactionButton({
  className,
  disabled = false,
  text: idleText = 'Transact',
  renderAction,
}: TransactionButtonProps) {
  const context = useTransactionContext();
  const {
    chainId,
    errorMessage,
    isLoading,
    onSubmit,
    receipt,
    transactions,
    transactionHash,
    transactionId,
  } = context;

  const { address } = useConnection();
  const currentChainId = useChainId();
  const accountChainId = chainId ?? currentChainId;

  const isMissingProps = !transactions || !address;
  const isWaitingForReceipt = !!transactionId || !!transactionHash;

  const isDisabled =
    !receipt &&
    (isLoading || isMissingProps || isWaitingForReceipt || disabled);

  const handleSuccess = () => {
    // SW will have txn id so open in wallet
    if (receipt && transactionId && transactionHash && chainId && address) {
      const url = new URL('https://wallet.coinbase.com/assets/transactions');
      url.searchParams.set('contentParams[txHash]', transactionHash);
      url.searchParams.set('contentParams[chainId]', JSON.stringify(chainId));
      url.searchParams.set('contentParams[fromAddress]', address);
      return window.open(url, '_blank', 'noopener,noreferrer');
    }
    // EOA will not have txn id so open in explorer
    const chainExplorer = getChainExplorer();
    return window.open(
      `${chainExplorer}/tx/${transactionHash}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const buttonContent = (() => {
    // txn successful
    if (receipt) {
      return 'View transaction';
    }
    if (errorMessage) {
      return 'Try again';
    }
    if (isLoading) {
      return <Spinner />;
    }
    return idleText;
  })();

  const handleSubmit = () => {
    if (receipt) {
      handleSuccess();
    } else {
      onSubmit();
    }
  };

  const status = (() => {
    if (receipt) {
      return 'success';
    }
    if (errorMessage) {
      return 'error';
    }
    if (isLoading) {
      return 'pending';
    }
    return 'default';
  })();

  if (renderAction) {
    return renderAction({
      status,
      context,
      onSubmit: handleSubmit,
      onSuccess: handleSuccess,
      isDisabled,
    });
  }

  return (
    <button
      className={cn(
        "cursor-pointer bg-primary hover:bg-primary-hover active:bg-primary-active focus:bg-primary-active",
        'rounded-default',
        'w-full rounded-xl',
        'px-4 py-3 font-medium leading-6',
        isDisabled && "opacity-[0.38] pointer-events-none",
        "font-semibold",
        'text-foreground-inverse',
        className,
      )}
      onClick={handleSubmit}
      type="button"
      disabled={isDisabled}
    >
      {buttonContent}
    </button>
  );
}

export function Transaction({
  calls,
  chainId,
  className,
  children,
  disabled = false,
  isSponsored,
  onError,
  onStatus,
  onSuccess,
  resetAfter,
}: TransactionProps) {
  const accountChainId = chainId ? chainId : base.id;

  return (
    <TransactionProvider
      calls={calls}
      chainId={accountChainId}
      isSponsored={isSponsored}
      onError={onError}
      onStatus={onStatus}
      onSuccess={onSuccess}
      resetAfter={resetAfter}
    >
      <div className={`flex w-full flex-col gap-2 ${className || ''}`}>
        {children ?? <TransactionButton disabled={disabled} />}
      </div>
    </TransactionProvider>
  );
}
