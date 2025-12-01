"use client";

import Image from "next/image";
import {
  BASE_APP_PROFILE_URL,
  FARCASTER_PROFILE_URL,
  GITHUB_URL,
  PRODUCT_CLANK_MINIAPP_URL,
  PRODUCT_CLANK_WEB_URL,
  PROFILE_FID,
  TWITTER_URL,
  useAboutLogic,
} from "@/components/about/use-about-logic";
import { Icons } from "./icons";
import { Button } from "./ui/button";
import { ButtonGroup, ButtonGroupText } from "./ui/button-group";

export function About() {
  const { isInMiniApp, handleOpenMiniApp, handleOpenUrl, handleViewProfile } =
    useAboutLogic();

  return (
    <div className="my-12 flex flex-col gap-2 rounded-lg border">
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
            Earn 10 DEGEN tokens per successful daily GM on Base. Rewards reset
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
