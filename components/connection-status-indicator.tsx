"use client";

import { useConnection } from "@/hooks/use-connection";

/**
 * Component to display SpacetimeDB connection status and reconnection state.
 * This demonstrates the RES-004 automatic reconnection feature.
 */
export function ConnectionStatusIndicator() {
  const connection = useConnection();

  return (
    <div className="fixed bottom-4 right-4 rounded-lg border bg-background p-4 shadow-lg">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div
            className={`h-3 w-3 rounded-full ${
              connection.isConnected
                ? "bg-green-500"
                : connection.isReconnecting
                  ? "animate-pulse bg-yellow-500"
                  : "bg-red-500"
            }`}
          />
          <span className="text-sm font-medium">
            {connection.isConnected
              ? "Connected"
              : connection.isReconnecting
                ? "Reconnecting..."
                : "Disconnected"}
          </span>
        </div>

        {connection.isReconnecting && (
          <div className="text-xs text-muted-foreground">
            Attempt {connection.reconnectAttempts}
          </div>
        )}

        {connection.isSubscribed && (
          <div className="text-xs text-green-600">✓ Subscribed</div>
        )}

        {connection.error && (
          <div className="text-xs text-red-600">
            Error: {connection.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
