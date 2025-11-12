"use client";

import { useOpenUrl, useViewProfile } from "@coinbase/onchainkit/minikit";
import { sdk } from "@farcaster/miniapp-sdk";
import Image from "next/image";
import { useCallback } from "react";
import { toast } from "sonner";
import { Icons } from "./icons";
import { useMiniAppContext } from "./providers/miniapp-provider";
import { Button } from "./ui/button";
import { ButtonGroup, ButtonGroupText } from "./ui/button-group";

const PRODUCT_CLANK_MINIAPP_URL =
  "https://miniapp.productclank.com/frame/25a3822f-e828-4af5-868c-a2061bf66e20?referrer=52d833eb-c0b5-484f-baa9-49eb95317ecf" as const;
const PRODUCT_CLANK_WEB_URL =
  "https://app.productclank.com/product/25a3822f-e828-4af5-868c-a2061bf66e20?referrer=52d833eb-c0b5-484f-baa9-49eb95317ecf" as const;
const PROFILE_FID = 999_883 as const;
const GITHUB_URL = "https://github.com/nirwanadoteth/onepulse" as const;
const TWITTER_URL = "https://twitter.com/nirwana_eth" as const;
const BASE_APP_PROFILE_URL = "https://base.app/profile/nirwana.eth" as const;
const FARCASTER_PROFILE_URL = "https://farcaster.xyz/nirwana.eth" as const;

export function About() {
  const miniappContext = useMiniAppContext();
  const openUrl = useOpenUrl();
  const viewProfile = useViewProfile();

  const isInMiniApp = Boolean(miniappContext?.isInMiniApp);

  const handleOpenMiniApp = useCallback(
    async (url: string) => {
      try {
        await sdk.actions.openMiniApp({ url });
      } catch (_error) {
        toast.error("Failed to open Mini App");
        openUrl(url);
      }
    },
    [openUrl]
  );

  const handleOpenUrl = useCallback(
    (url: string) => {
      openUrl(url);
    },
    [openUrl]
  );

  const handleViewProfile = useCallback(
    (fid: number) => {
      viewProfile(fid);
    },
    [viewProfile]
  );

  return (
    <div className="mt-4 mb-12 flex flex-col gap-2 rounded-lg border">
      <div className="flex w-full justify-center p-4 data-[align=start]:items-start data-[align=end]:items-end data-[align=center]:items-center">
        <div>
          <h1 className="text-balance font-bold text-xl tracking-tight">
            About OnePulse
          </h1>

          <p className="not-first:mt-4 text-muted-foreground text-sm leading-4">
            OnePulse helps you send a daily on‑chain GM (a short social
            greeting), track your streaks across multiple networks, and earn
            DEGEN token rewards.
          </p>

          <h2 className="mt-4 border-b font-semibold text-lg tracking-tight first:mt-0">
            Networks
          </h2>
          <p className="not-first:mt-4 text-sm leading-4">
            OnePulse currently supports the following networks:
          </p>
          <ul className="my-4 ml-6 list-disc text-xs [&>li]:mt-2">
            <li>Base</li>
            <li>Celo</li>
            <li>Optimism</li>
          </ul>

          <h2 className="mt-4 border-b font-semibold text-lg tracking-tight first:mt-0">
            How It Works
          </h2>
          <p className="not-first:mt-4 text-sm leading-4">
            To get started with OnePulse, follow these steps:
          </p>
          <ol className="my-4 ml-6 list-decimal text-xs [&>li]:mt-2">
            <li>Connect your wallet</li>
            <li>Send GM on any supported network.</li>
            <li>Track your daily streaks within the app.</li>
            <li>Repeat daily to maintain and grow your streaks.</li>
          </ol>

          <h2 className="mt-4 border-b font-semibold text-lg tracking-tight first:mt-0">
            Rewards
          </h2>
          <p className="not-first:mt-4 text-sm leading-4">
            Earn 7 DEGEN tokens per successful daily GM on Base. Rewards reset
            daily and are subject to change.
          </p>

          <h2 className="mt-4 border-b font-semibold text-lg tracking-tight first:mt-0">
            Contact & Support
          </h2>
          <p className="not-first:mt-4 text-sm leading-4">
            Need help or want to report a problem?{" "}
            <button
              aria-label="Open support profile"
              className="underline"
              onClick={() =>
                isInMiniApp
                  ? handleViewProfile(PROFILE_FID)
                  : handleOpenUrl(FARCASTER_PROFILE_URL)
              }
              type="button"
            >
              Open support profile
            </button>
            .
          </p>

          <ButtonGroup aria-label="Social links" className="mt-4">
            <ButtonGroupText>Socials</ButtonGroupText>
            <Button
              onClick={() =>
                isInMiniApp
                  ? handleViewProfile(PROFILE_FID)
                  : handleOpenUrl(BASE_APP_PROFILE_URL)
              }
              size="icon"
              variant="outline"
            >
              <Icons.baseSquare className="h-6 w-6" />
              <span className="sr-only">Base</span>
            </Button>
            <Button
              onClick={() =>
                isInMiniApp
                  ? handleViewProfile(PROFILE_FID)
                  : handleOpenUrl(FARCASTER_PROFILE_URL)
              }
              size="icon"
              variant="outline"
            >
              <Icons.farcaster className="h-6 w-6" />
              <span className="sr-only">Farcaster</span>
            </Button>
            <Button
              onClick={() => handleOpenUrl(GITHUB_URL)}
              size="icon"
              variant="outline"
            >
              <Icons.gitHub className="h-6 w-6" />
              <span className="sr-only">GitHub</span>
            </Button>
            <Button
              onClick={() =>
                isInMiniApp
                  ? handleOpenMiniApp(PRODUCT_CLANK_MINIAPP_URL)
                  : handleOpenUrl(PRODUCT_CLANK_WEB_URL)
              }
              size="icon"
              variant="outline"
            >
              <Image
                alt="Product Clank logo"
                height={24}
                src="/productclank.png"
                width={24}
              />
              <span className="sr-only">Product Clank</span>
            </Button>
            <Button
              onClick={() => handleOpenUrl(TWITTER_URL)}
              size="icon"
              variant="outline"
            >
              <Icons.twitter className="h-6 w-6" />
              <span className="sr-only">Twitter</span>
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </div>
  );
}

export default About;
