import { useConnection } from "wagmi";

type UseHeaderLogicReturn = {
  address: `0x${string}` | undefined;
  shouldShowUserInfo: boolean;
};

export function useHeaderLogic(): UseHeaderLogicReturn {
  const { address } = useConnection();

  const shouldShowUserInfo = !!address;

  return {
    address,
    shouldShowUserInfo,
  };
}
