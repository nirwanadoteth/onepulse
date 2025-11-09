import {
  connectionStatus,
  onConnectionChange,
} from "@/lib/spacetimedb/connection-events";

class ConnectionStore {
  private readonly listeners: Set<() => void> = new Set();

  constructor() {
    onConnectionChange(() => {
      this.emitChange();
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
    return connectionStatus;
  }

  getServerSnapshot() {
    return connectionStatus;
  }

  private emitChange() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const connectionStore = new ConnectionStore();
