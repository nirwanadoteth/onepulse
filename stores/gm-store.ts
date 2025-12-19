import type { Infer } from "spacetimedb";
import type { DbConnection } from "@/lib/module_bindings";
import type GmStatsByAddressSchema from "@/lib/module_bindings/gm_stats_by_address_table";
import {
  connectionStatus,
  onConnectionChange,
} from "@/lib/spacetimedb/connection-events";
import { getDbConnection } from "@/lib/spacetimedb/connection-factory";
import { onSubscriptionChange } from "@/lib/spacetimedb/subscription-events";

type GmStatsByAddress = Infer<typeof GmStatsByAddressSchema>;

type ReportGmParams = {
  address: string;
  chainId: number;
  lastGmDayOnchain: number;
  txHash: string | undefined;
  fid: bigint | undefined;
  displayName: string | undefined;
  username: string | undefined;
};

class GmStatsByAddressStore {
  private readonly listeners: Set<() => void> = new Set();
  private connection: DbConnection | null = null;
  private cachedSnapshot: GmStatsByAddress[] = [];
  private readonly serverSnapshot: GmStatsByAddress[] = [];
  private subscribedAddress: string | null = null;
  private subscriptionReady = false;
  private refreshListeners: Array<(address: string) => void> = [];

  constructor() {
    onSubscriptionChange(() => {
      this.subscriptionReady = true;
      this.updateSnapshot();
    });
  }

  subscribe(onStoreChange: () => void) {
    this.listeners.add(onStoreChange);
    return () => {
      this.listeners.delete(onStoreChange);
    };
  }

  getSnapshot() {
    try {
      this.getConnection();
      return this.cachedSnapshot;
    } catch {
      // Snapshot error handled gracefully by returning server snapshot
      return this.serverSnapshot;
    }
  }

  getServerSnapshot() {
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

    this.emitRefreshEvent(address);

    this.subscriptionReady = false;

    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      this.updateSnapshot();
      this.subscriptionReady = true;
      this.emitChange();
    } catch {
      // Snapshot refresh failure handled, continuing with refresh
      this.subscriptionReady = true;
      this.emitChange();
    }
  }

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
      } catch {
        // Listener error handled silently
      }
    }
  }

  async subscribeToAddress(address?: string | null) {
    if (!address) {
      return;
    }
    const addr = address.toLowerCase();

    if (
      this.subscribedAddress?.toLowerCase() === addr &&
      this.subscriptionReady
    ) {
      return;
    }

    this.subscribedAddress = address;
    this.subscriptionReady = false;
    this.cachedSnapshot = [];
    this.emitChange();

    const conn = this.getConnection();

    if (!connectionStatus.isConnected) {
      await new Promise<void>((resolve) => {
        const unsubscribe = onConnectionChange(() => {
          if (connectionStatus.isConnected) {
            unsubscribe();
            resolve();
          }
        });
        setTimeout(() => {
          unsubscribe();
          resolve();
        }, 5000);
      });
    }

    if (
      this.subscribedAddress &&
      this.subscribedAddress.toLowerCase() !== addr
    ) {
      return;
    }

    if (!connectionStatus.isConnected) {
      this.subscriptionReady = false;
      this.emitChange();
      return;
    }

    try {
      conn
        .subscriptionBuilder()
        .onApplied(() => {
          this.subscriptionReady = true;
          this.updateSnapshot();
        })
        .onError(() => {
          this.subscriptionReady = false;
          this.emitChange();
        })
        .subscribe([
          `SELECT * FROM gm_stats_by_address WHERE address = '${address}'`,
        ]);
    } catch (error) {
      console.error(
        `[GmStore] Failed to subscribe to GM stats for ${address}:`,
        error
      );
      this.subscriptionReady = false;
      this.emitChange();
    }
  }

  reportGm(params: ReportGmParams) {
    if (this.connection) {
      this.connection.reducers.reportGm(params);
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
