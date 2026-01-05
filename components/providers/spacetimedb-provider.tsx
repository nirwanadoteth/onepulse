"use client";

import type { ReactNode } from "react";
import type { Identity } from "spacetimedb";
import { SpacetimeDBProvider as Provider } from "spacetimedb/react";
import { DbConnection, type ErrorContext } from "@/spacetimedb";

const HOST = process.env.SPACETIMEDB_HOST || "wss://maincloud.spacetimedb.com";
const MODULE = process.env.SPACETIMEDB_MODULE || "onepulse-v2";

if (!HOST) {
  throw new Error("SPACETIMEDB_HOST is not defined");
}

if (!MODULE) {
  throw new Error("SPACETIMEDB_MODULE is not defined");
}

const getToken = (): string | undefined => {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    return localStorage.getItem("auth_token") || undefined;
  }
  return undefined;
};

const setToken = (token: string) => {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
};

const onConnect = (conn: DbConnection, identity: Identity, token: string) => {
  setToken(token);
  console.log(
    "Connected to SpacetimeDB with identity:",
    identity.toHexString()
  );
  conn.reducers.onReport(() => {
    console.log("Report sent.");
  });
};

const onDisconnect = () => {
  console.log("Disconnected from SpacetimeDB");
};

const onConnectError = (_ctx: ErrorContext, err: Error) => {
  console.log("Error connecting to SpacetimeDB:", err);
};

const connectionBuilder = DbConnection.builder()
  .withUri(HOST)
  .withModuleName(MODULE)
  .withToken(getToken())
  .onConnect(onConnect)
  .onDisconnect(onDisconnect)
  .onConnectError(onConnectError);

export const SpacetimeDBProvider = ({ children }: { children: ReactNode }) => {
  return <Provider connectionBuilder={connectionBuilder}>{children}</Provider>;
};
