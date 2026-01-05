import { useConnection } from "wagmi";

type UseHomeLogicReturn = {
  isConnected: boolean;
  address: `0x${string}` | undefined;
};

export function useHomeLogic(): UseHomeLogicReturn {
  const { isConnected, address } = useConnection();

  return {
    isConnected,
    address,
  };
}
