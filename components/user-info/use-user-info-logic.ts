import { useAvatar, useName } from "@coinbase/onchainkit/identity";
import { base } from "@wagmi/core/chains";
import type { Address } from "viem/accounts";
import { normalize } from "viem/ens";
import { useConnection } from "wagmi";
import { determineDisplayState, type UserInfoProps } from "./utils";

export function useUserInfoLogic({
  user,
  address: addressProp,
}: UserInfoProps) {
  const { address: connectedAddress, isConnected } = useConnection();
  const address = (addressProp || connectedAddress) as Address;

  const { data: ensName, isLoading: isNameLoading } = useName(
    {
      address,
      chain: base,
    },
    { enabled: !!address }
  );
  const { data: ensAvatar, isLoading: isAvatarLoading } = useAvatar(
    {
      ensName: ensName ? normalize(ensName) : "",
      chain: base,
    },
    { enabled: !!ensName && !isNameLoading }
  );

  const isLoading = isNameLoading || isAvatarLoading;
  const state = determineDisplayState(user, address, isLoading);

  return {
    address,
    ensName,
    ensAvatar,
    isConnected,
    state,
  };
}
