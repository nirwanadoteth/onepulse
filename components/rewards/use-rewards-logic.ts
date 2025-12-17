import { useAppKitAccount } from "@reown/appkit/react";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";

export function useRewardsLogic() {
  const { isConnected, address } = useAppKitAccount({ namespace: "eip155" });
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
