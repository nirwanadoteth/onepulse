import type { Identity } from "spacetimedb";

export const connectionStatus = {
  isConnected: false,
  isSubscribed: false,
  isReconnecting: false,
  reconnectAttempts: 0,
  error: null as Error | null,
  identity: null as Identity | null,
};

const listeners = new Set<() => void>();
export const onConnectionChange = (callback: () => void) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export const notifyConnectionEstablished = () => {
  for (const callback of listeners) {
    callback();
  }
};
export const notifyConnectionDisconnected = () => {
  for (const callback of listeners) {
    callback();
  }
};
export const notifyConnectionError = () => {
  for (const callback of listeners) {
    callback();
  }
};

export const cleanupConnectionListener = () => {
  listeners.clear();
};
