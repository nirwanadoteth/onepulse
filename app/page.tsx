"use client";
import { useState, useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { Transaction, TransactionButton, TransactionStatus, TransactionToast } from "@coinbase/onchainkit/transaction";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import { useAccount } from "wagmi";
import { isAddress } from "viem";
import { minikitConfig } from "../minikit.config";
import { DAILY_GM_ADDRESS } from "../lib/constants";
import { dailyGMAbi } from "../lib/abi/dailyGM";
import styles from "./page.module.css";

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const { address, isConnected } = useAccount();
  const [recipient, setRecipient] = useState("");

  // Initialize the  miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);



  const isContractReady = Boolean(DAILY_GM_ADDRESS && DAILY_GM_ADDRESS !== "");
  const isRecipientValid = recipient === "" ? false : isAddress(recipient);

  return (
    <div className={styles.container}>
      <button className={styles.closeButton} type="button">✕</button>
      <div className={styles.content}>
        <div className={styles.waitlistForm}>
          <h1 className={styles.title}>{minikitConfig.miniapp.name.toUpperCase()}</h1>
          <p className={styles.subtitle}>
            Hey {context?.user?.displayName || "there"}, say GM on Base and start your streak.
          </p>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center", justifyContent: "center", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            <ConnectWallet />
          </div>

          {!isContractReady && (
            <p className={styles.error} style={{ textAlign: "center" }}>
              Contract not configured. Set NEXT_PUBLIC_DAILY_GM_ADDRESS to enable GM.
            </p>
          )}

          {/* GM (no recipient) */}
          <div style={{ marginTop: "1rem" }}>
            {address && (
              <Transaction
                calls={[
                  {
                    abi: dailyGMAbi,
                    address: DAILY_GM_ADDRESS as `0x${string}`,
                    functionName: "gm",
                  },
                ]}
              >
                <TransactionButton
                  disabled={!isConnected || !isContractReady}
                  text="GM"
                />
                <TransactionStatus />
                <TransactionToast />
              </Transaction>
            )}
          </div>

          {/* GM to a recipient - only visible when connected */}
          {isConnected && (
            <div style={{ marginTop: "2rem" }}>
              <div className={styles.form}>
                <input
                  type="text"
                  placeholder="Recipient address (0x...)"
                  value={recipient}
                  onChange={(e) => {
                    setRecipient(e.target.value);
                  }}
                  className={styles.emailInput}
                />
                {recipient && !isRecipientValid && (
                  <p className={styles.error}>Enter a valid address.</p>
                )}

                {address && (
                  <Transaction
                    calls={[
                      {
                        abi: dailyGMAbi,
                        address: DAILY_GM_ADDRESS as `0x${string}`,
                        functionName: "gmTo",
                        args: [recipient as `0x${string}`],
                      },
                    ]}
                  >
                    <TransactionButton
                      disabled={!isConnected || !isContractReady || !isRecipientValid}
                      text="GM to recipient"
                    />
                    <TransactionStatus />
                    <TransactionToast />
                  </Transaction>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
