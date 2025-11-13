"use client";

import { DbConnection } from "@/lib/module_bindings";
import { cleanupConnectionListener } from "@/lib/spacetimedb/connection-events";
import {
  onConnect,
  onConnectError,
  onDisconnect,
} from "@/lib/spacetimedb/connection-handlers";
import { cleanupSubscriptionListener } from "@/lib/spacetimedb/subscription-events";

let singletonConnection: DbConnection | null = null;

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

export const disconnectDbConnection = () => {
  if (singletonConnection) {
    singletonConnection.disconnect();
    singletonConnection = null;
  }
  cleanupConnectionListener();
  cleanupSubscriptionListener();
};
