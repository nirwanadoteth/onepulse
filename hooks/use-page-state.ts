import { useConnection } from "wagmi";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";

export function usePageState() {
  const { address, isConnected } = useConnection();
  const miniAppContextData = useMiniAppContext();
  const inMiniApp = miniAppContextData?.isInMiniApp ?? false;

  return { inMiniApp, isConnected, address };
}
