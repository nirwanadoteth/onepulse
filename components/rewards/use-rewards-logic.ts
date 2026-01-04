import { useConnection } from "wagmi";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";

export function useRewardsLogic() {
  const { isConnected, address } = useConnection();
  const miniAppContextData = useMiniAppContext();

  const fid = miniAppContextData?.context?.user?.fid
    ? BigInt(miniAppContextData.context.user.fid)
    : undefined;

  return {
    isConnected,
    fid,
    address,
  };
}
