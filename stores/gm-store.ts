import type { DbConnection, GmStatsByAddress } from "@/lib/module_bindings";
import { getDbConnection } from "@/lib/spacetimedb/connection-factory";
import { onSubscriptionChange } from "@/lib/spacetimedb/subscription-events";

type ReportGmParams = {
  address: string;
  chainId: number;
  lastGmDay: number;
  txHash: string;
  fid: bigint;
  displayName: string;
  username: string;
};

class GmStatsByAddressStore {
  private readonly listeners: Set<() => void> = new Set();
  private connection: DbConnection | null = null;
  private cachedSnapshot: GmStatsByAddress[] = [];
  private readonly serverSnapshot: GmStatsByAddress[] = [];
  private subscribedAddress: string | null = null;
  private subscriptionReady = false;

  constructor() {
    onSubscriptionChange(() => {
      // Global subscription event; refresh snapshot
      this.subscriptionReady = true;
      this.updateSnapshot();
    });
  }

  subscribe(onStoreChange: () => void) {
    this.listeners.add(onStoreChange);
    return () => {
      // Cleanup on unmount
      this.listeners.delete(onStoreChange);
    };
  }

  getSnapshot() {
    try {
      this.getConnection();
      return this.cachedSnapshot;
    } catch (error) {
      const isNotSSR = typeof window !== "undefined";
      if (isNotSSR) {
        // This would be an unexpected error on the client-side
        console.error("Unexpected error while obtaining snapshot:", error);
      }
      return this.serverSnapshot;
    }
  }

  getServerSnapshot() {
    // Return the same reference to prevent unnecessary SSR re-renders
    return this.serverSnapshot;
  }

  isSubscribedForAddress(address?: string | null) {
    if (!address) {
      return false;
    }
    return (
      this.subscriptionReady &&
      this.subscribedAddress?.toLowerCase() === address.toLowerCase()
    );
  }

  async refreshForAddress(address?: string | null) {
    if (!address) {
      return;
    }

    // Signal to all listeners that they should clear their fallback cache
    this.emitRefreshEvent(address);

    // Temporarily mark subscription as not ready to trigger fallback API fetch
    // Don't emit change yet - batch it with the pull below
    this.subscriptionReady = false;

    // Small delay to let components start fallback fetch
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Now pull fresh snapshot and restore ready state, emit only once
    try {
      this.updateSnapshot();
      this.subscriptionReady = true;
      // Emit change only once after both state updates
      this.emitChange();
    } catch (error) {
      console.error(
        "[gmStatsByAddressStore] ❌ Failed to refresh snapshot:",
        error
      );
      this.subscriptionReady = true;
      this.emitChange();
    }
  }

  private refreshListeners: Array<(address: string) => void> = [];

  onRefresh(callback: (address: string) => void) {
    this.refreshListeners.push(callback);
    return () => {
      this.refreshListeners = this.refreshListeners.filter(
        (cb) => cb !== callback
      );
    };
  }

  private emitRefreshEvent(address: string) {
    for (const listener of this.refreshListeners) {
      try {
        listener(address);
      } catch (e) {
        console.error("[gmStatsByAddressStore] Error in refresh listener:", e);
      }
    }
  }

  async subscribeToAddress(address?: string | null) {
    if (!address) {
      return;
    }
    const addr = address.toLowerCase();

    // If already subscribed to this address, do nothing
    if (
      this.subscribedAddress?.toLowerCase() === addr &&
      this.subscriptionReady
    ) {
      return;
    }

    this.subscribedAddress = address;
    this.subscriptionReady = false;
    // Clear snapshot while (re)subscribing to avoid showing stale data
    this.cachedSnapshot = [];
    this.emitChange();

    const conn = this.getConnection();

    // Small delay to allow connection to establish
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      conn
        .subscriptionBuilder()
        .onApplied(() => {
          this.subscriptionReady = true;
          this.updateSnapshot();
        })
        .onError(() => {
          this.subscriptionReady = false;
          // Keep snapshot empty on error; UI can show zeros gracefully
          this.emitChange();
        })
        .subscribe([
          `SELECT * FROM gm_stats_by_address WHERE address = '${address}'`,
        ]);
    } catch (error) {
      console.error(
        `[gmStatsByAddressStore] Subscription setup failed for ${addr}:`,
        error
      );
      this.subscriptionReady = false;
      this.emitChange();
    }
  }

  reportGm(params: ReportGmParams) {
    if (this.connection) {
      this.connection.reducers.reportGm(
        params.address,
        params.chainId,
        params.lastGmDay,
        params.txHash,
        params.fid,
        params.displayName,
        params.username
      );
    }
  }

  private getConnection(): DbConnection {
    if (!this.connection) {
      this.connection = getDbConnection();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      this.connection.db.gmStatsByAddress.onInsert((_ctx, _row) => {
        this.updateSnapshot();
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      this.connection.db.gmStatsByAddress.onDelete((_ctx, _row) => {
        this.updateSnapshot();
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      this.connection.db.gmStatsByAddress.onUpdate((_ctx, _old, _new) => {
        this.updateSnapshot();
      });
    }
    return this.connection;
  }

  private updateSnapshot() {
    if (this.connection) {
      this.cachedSnapshot = Array.from(
        this.connection.db.gmStatsByAddress.iter()
      );
      this.emitChange();
    }
  }

  private emitChange() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const gmStatsByAddressStore = new GmStatsByAddressStore();
