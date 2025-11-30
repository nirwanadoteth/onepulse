import type { Identity } from "spacetimedb";

import type { DbConnection, ErrorContext } from "@/lib/module_bindings";
import {
  connectionStatus,
  notifyConnectionDisconnected,
  notifyConnectionError,
  notifyConnectionEstablished,
} from "@/lib/spacetimedb/connection-events";
import {
  startAutoReconnect,
  stopAutoReconnect,
} from "@/lib/spacetimedb/connection-factory";
import {
  notifySubscriptionApplied,
  notifySubscriptionError,
} from "@/lib/spacetimedb/subscription-events";

export const onConnect = (
  conn: DbConnection,
  identity: Identity,
  token: string
) => {
  console.log("[SpacetimeDB] Connection established");

  // Stop auto-reconnect on successful connection
  stopAutoReconnect();

  connectionStatus.isConnected = true;
  connectionStatus.error = null;
  connectionStatus.identity = identity;

  // Only access localStorage in browser environment
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    localStorage.setItem("auth_token", token);
  }

  notifyConnectionEstablished();

  // Re-establish subscriptions after reconnection
  subscribeToQueries(conn, ["SELECT * FROM gm_stats_by_address"]);
};

export const onDisconnect = () => {
  console.log("[SpacetimeDB] Connection disconnected");

  connectionStatus.isConnected = false;
  connectionStatus.isSubscribed = false;
  notifyConnectionDisconnected();

  // Start auto-reconnect when connection is lost
  startAutoReconnect();
};

export const onConnectError = (_ctx: ErrorContext, error: Error) => {
  console.error("[SpacetimeDB] Connection error:", error);

  connectionStatus.isConnected = false;
  connectionStatus.isSubscribed = false;
  connectionStatus.error = error;
  notifyConnectionError();

  // Trigger reconnection on connection error
  startAutoReconnect();
};

export const subscribeToQueries = (conn: DbConnection, queries: string[]) => {
  conn
    ?.subscriptionBuilder()
    .onApplied(() => {
      connectionStatus.isSubscribed = true;
      notifySubscriptionApplied();
    })
    .onError(() => {
      connectionStatus.isSubscribed = false;
      notifySubscriptionError();
    })
    .subscribe(queries);
};
