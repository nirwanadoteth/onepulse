import { OnchainKitProvider as Provider } from "@coinbase/onchainkit";
import { base } from "wagmi/chains";

import "@/styles/onchainkit.css";

export function OnchainKitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: {
          name: process.env.NEXT_PUBLIC_PROJECT_NAME,
          logo: `${process.env.NEXT_PUBLIC_URL}/logo.png`,
          mode: "auto",
          theme: "custom",
        },
        wallet: {
          display: "modal",
          preference: "all",
          supportedWallets: {
            rabby: true,
            trust: true,
            frame: true,
          },
        },
        paymaster: process.env.PAYMASTER_ENDPOINT,
      }}
      miniKit={{
        enabled: true,
        autoConnect: true,
        notificationProxyUrl: undefined,
      }}
      projectId={process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_ID}
    >
      {children}
    </Provider>
  );
}
