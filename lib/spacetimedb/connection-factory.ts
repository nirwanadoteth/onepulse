"use client";

import { DbConnection } from "@/lib/module_bindings";
import {
  cleanupConnectionListener,
  connectionStatus,
} from "@/lib/spacetimedb/connection-events";
import {
  onConnect,
  onConnectError,
  onDisconnect,
} from "@/lib/spacetimedb/connection-handlers";
import { ExponentialBackoffReconnectionStrategy } from "@/lib/spacetimedb/reconnection-strategy";
import { cleanupSubscriptionListener } from "@/lib/spacetimedb/subscription-events";

let singletonConnection: DbConnection | null = null;
let reconnectionTimeoutId: ReturnType<typeof setTimeout> | null = null;
const reconnectionStrategy = new ExponentialBackoffReconnectionStrategy();

export const getDbConnection = (): DbConnection => {
  const isSSR = typeof window === "undefined";
  if (isSSR) {
    throw new Error("Cannot use SpacetimeDB on the server.");
  }

  if (singletonConnection) {
    return singletonConnection;
  }

  singletonConnection = buildDbConnection();
  return singletonConnection;
};

const buildDbConnection = () => {
  const uri =
    process.env.SPACETIMEDB_HOST ||
    process.env.SPACETIMEDB_HOST_URL ||
    "ws://127.0.0.1:3000";
  const moduleName = process.env.SPACETIMEDB_MODULE || "onepulse";
  
  // SEC-001: Enforce WSS (WebSocket Secure) in production environments
  if (process.env.NODE_ENV === "production") {
    if (!uri.startsWith("wss://")) {
      throw new Error(
        `Production requires WSS (wss://) protocol. Received: ${uri}. ` +
        "Please update SPACETIMEDB_HOST or SPACETIMEDB_HOST_URL to use wss:// for secure connections."
      );
    }
  }
  
  // Development warning for unencrypted connections
  if (process.env.NODE_ENV === "development" && uri.startsWith("ws://") && !uri.includes("127.0.0.1") && !uri.includes("localhost")) {
    console.warn(
      "⚠️  Security Warning: Using ws:// (unencrypted) for non-local connection. " +
      "Production MUST use wss:// protocol. Current URI: " + uri
    );
  }
  
  const token = getAuthToken();
  const builder = DbConnection.builder()
    .withUri(uri)
    .withModuleName(moduleName)
    .onConnect(onConnect)
    .onDisconnect(onDisconnect)
    .onConnectError(onConnectError);

  if (token) {
    builder.withToken(token);
  }

  return builder.build();
};

const getAuthToken = () => process.env.SPACETIMEDB_TOKEN || "";

/**
 * Attempt to reconnect to SpacetimeDB with exponential backoff.
 * Implements RES-004 requirement for automatic reconnection.
 */
const attemptReconnect = () => {
  if (!reconnectionStrategy.canRetry()) {
    console.error("[SpacetimeDB] Max reconnection attempts reached");
    connectionStatus.isReconnecting = false;
    return;
  }

  const delay = reconnectionStrategy.getNextDelay();
  const attemptCount = reconnectionStrategy.getAttemptCount();
  
  console.log(
    `[SpacetimeDB] Attempting reconnection (attempt ${attemptCount}) in ${delay}ms...`
  );

  connectionStatus.isReconnecting = true;
  connectionStatus.reconnectAttempts = attemptCount;

  // Clear any existing timeout to prevent memory leaks
  if (reconnectionTimeoutId) {
    clearTimeout(reconnectionTimeoutId);
    reconnectionTimeoutId = null;
  }

  reconnectionTimeoutId = setTimeout(() => {
    try {
      console.log(`[SpacetimeDB] Executing reconnection attempt ${attemptCount}`);
      
      // Clean up existing connection to prevent multiple connections
      if (singletonConnection) {
        singletonConnection.disconnect();
        singletonConnection = null;
      }

      // Create new connection (which will trigger onConnect or onConnectError)
      singletonConnection = buildDbConnection();
    } catch (error) {
      console.error("[SpacetimeDB] Reconnection attempt failed:", error);
      // If connection creation fails, schedule next attempt
      attemptReconnect();
    }
  }, delay);
};

/**
 * Start the automatic reconnection process.
 * Called when connection is lost (from onDisconnect handler).
 */
export const startAutoReconnect = () => {
  console.log("[SpacetimeDB] Starting auto-reconnect");
  attemptReconnect();
};

/**
 * Stop the automatic reconnection process and reset the strategy.
 * Called when connection is successfully established.
 */
export const stopAutoReconnect = () => {
  console.log("[SpacetimeDB] Stopping auto-reconnect");
  
  // Clear timeout to prevent memory leaks
  if (reconnectionTimeoutId) {
    clearTimeout(reconnectionTimeoutId);
    reconnectionTimeoutId = null;
  }

  // Reset reconnection state
  reconnectionStrategy.reset();
  connectionStatus.isReconnecting = false;
  connectionStatus.reconnectAttempts = 0;
};

export const disconnectDbConnection = () => {
  // Stop auto-reconnect when manually disconnecting
  stopAutoReconnect();
  
  if (singletonConnection) {
    singletonConnection.disconnect();
    singletonConnection = null;
  }
  cleanupConnectionListener();
  cleanupSubscriptionListener();
};
