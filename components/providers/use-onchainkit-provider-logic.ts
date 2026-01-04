import { base } from "wagmi/chains";
import { minikitConfig } from "@/minikit.config";

export function useOnchainKitProviderLogic() {
  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_ID;
  const paymaster = process.env.PAYMASTER_ENDPOINT;
  const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME;

  const config = {
    appearance: {
      name: projectName,
      logo: minikitConfig.miniapp.splashImageUrl,
      mode: "auto" as const,
      theme: "custom" as const,
    },
    wallet: {
      display: "modal" as const,
      preference: "all" as const,
      supportedWallets: {
        rabby: true,
      },
    },
    paymaster,
  };

  const miniKit = {
    enabled: true,
    autoConnect: true,
    notificationProxyUrl: "/api/notify",
  };

  return {
    apiKey,
    projectId,
    chain: base,
    config,
    miniKit,
  };
}
