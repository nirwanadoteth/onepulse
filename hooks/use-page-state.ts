import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { detectCoinbaseSmartWallet } from "@/lib/utils";

export function usePageState() {
  const { address, isConnected } = useAppKitAccount({ namespace: "eip155" });
  const [isSmartWallet, setIsSmartWallet] = useState(false);
  const miniAppContextData = useMiniAppContext();
  const inMiniApp = miniAppContextData?.isInMiniApp ?? false;

  useEffect(() => {
    if (!(isConnected && address)) {
      return;
    }
    (async () => {
      const result = await detectCoinbaseSmartWallet(address as `0x${string}`);
      setIsSmartWallet(result);
    })();
  }, [isConnected, address]);

  return { isSmartWallet, inMiniApp, isConnected, address };
}
