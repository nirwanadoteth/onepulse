/* eslint-disable @typescript-eslint/no-unused-vars */
import { DbConnection, GmStatsByAddress } from "@/lib/module_bindings"
import { getDbConnection } from "@/lib/spacetimedb/connection-factory"
import { onSubscriptionChange } from "@/lib/spacetimedb/subscription-events"

interface ReportGmParams {
  address: string
  chainId: number
  lastGmDay: number
  txHash: string
  fid: bigint
  displayName: string
  username: string
}

class GmStatsByAddressStore {
  private listeners: Set<() => void> = new Set()
  private connection: DbConnection | null = null
  private cachedSnapshot: GmStatsByAddress[] = []
  private serverSnapshot: GmStatsByAddress[] = []
  private subscribedAddress: string | null = null
  private subscriptionReady = false

  constructor() {
    onSubscriptionChange(() => {
      // Global subscription event; refresh snapshot
      this.subscriptionReady = true
      this.updateSnapshot()
    })
  }

  public subscribe(onStoreChange: () => void) {
    this.listeners.add(onStoreChange)
    return () => {
      // Cleanup on unmount
      this.listeners.delete(onStoreChange)
    }
  }

  public getSnapshot() {
    try {
      this.getConnection()
      return this.cachedSnapshot
    } catch (error) {
      const isNotSSR = typeof window !== "undefined"
      if (isNotSSR) {
        // This would be an unexpected error on the client-side
        console.error("Unexpected error while obtaining snapshot:", error)
      }
      return this.serverSnapshot
    }
  }

  public getServerSnapshot() {
    // Return the same reference to prevent unnecessary SSR re-renders
    return this.serverSnapshot
  }

  public isSubscribedForAddress(address?: string | null) {
    if (!address) return false
    return (
      this.subscriptionReady &&
      this.subscribedAddress?.toLowerCase() === address.toLowerCase()
    )
  }

  public async subscribeToAddress(address?: string | null) {
    if (!address) return
    const addr = address.toLowerCase()
    // If already subscribed to this address, do nothing
    if (
      this.subscribedAddress?.toLowerCase() === addr &&
      this.subscriptionReady
    ) {
      return
    }
    this.subscribedAddress = address
    this.subscriptionReady = false
    // Clear snapshot while (re)subscribing to avoid showing stale data
    this.cachedSnapshot = []
    this.emitChange()

    const conn = this.getConnection()
    conn
      .subscriptionBuilder()
      .onApplied(() => {
        this.subscriptionReady = true
        this.updateSnapshot()
      })
      .onError(() => {
        this.subscriptionReady = false
        // Keep snapshot empty on error; UI can show zeros gracefully
        this.emitChange()
      })
      .subscribe([
        `SELECT * FROM gm_stats_by_address WHERE address = '${address}'`,
      ])
  }

  public reportGm(params: ReportGmParams) {
    if (this.connection) {
      this.connection.reducers.reportGm(
        params.address,
        params.chainId,
        params.lastGmDay,
        params.txHash,
        params.fid,
        params.displayName,
        params.username
      )
    }
  }

  private getConnection(): DbConnection {
    if (!this.connection) {
      this.connection = getDbConnection()
      this.connection.db.gmStatsByAddress.onInsert((ctx, row) =>
        this.updateSnapshot()
      )
      this.connection.db.gmStatsByAddress.onDelete((ctx, row) =>
        this.updateSnapshot()
      )
      this.connection.db.gmStatsByAddress.onUpdate((ctx, _old, _new) =>
        this.updateSnapshot()
      )
    }
    return this.connection
  }

  private updateSnapshot() {
    if (this.connection) {
      this.cachedSnapshot = Array.from(
        this.connection.db.gmStatsByAddress.iter()
      )
      this.emitChange()
    }
  }

  private emitChange() {
    for (const listener of this.listeners) {
      listener()
    }
  }
}

export const gmStatsByAddressStore = new GmStatsByAddressStore()
