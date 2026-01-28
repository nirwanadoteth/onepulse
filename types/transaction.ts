export type TransactionStatus = "default" | "success" | "error" | "pending";

/**
 * Represents the result of a transaction operation
 */
export type TransactionResult<T = unknown> = {
  success: boolean;
  status: TransactionStatus;
  data?: T;
  error?: Error | null;
  hash?: `0x${string}`;
};

/**
 * Represents wallet connection state
 */
export type WalletState = {
  isConnected: boolean;
  address?: `0x${string}`;
  chainId?: number;
  isConnecting?: boolean;
};

/**
 * Represents user activity on a chain
 */
export type ChainActivity = {
  chainId: number;
  lastActivityTime: number;
  hasClaimedToday: boolean;
  consecutiveDays: number;
};
