import { useMemo } from "react";
import { useConnection } from "@/hooks/use-connection";

export function useConnectionStatusLogic() {
  const connection = useConnection();

  const statusInfo = useMemo(() => {
    if (connection.isConnected) {
      return { className: "bg-green-500", text: "Connected" };
    }
    if (connection.isReconnecting) {
      return {
        className: "animate-pulse bg-yellow-500",
        text: "Reconnecting...",
      };
    }
    return { className: "bg-red-500", text: "Disconnected" };
  }, [connection.isConnected, connection.isReconnecting]);

  return {
    connection,
    statusInfo,
  };
}
