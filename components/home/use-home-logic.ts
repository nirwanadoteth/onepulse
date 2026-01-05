import { useConnection } from "wagmi";

export const useHomeLogic = () => {
  const { isConnected, address } = useConnection();

  return {
    isConnected,
    address,
  };
};
