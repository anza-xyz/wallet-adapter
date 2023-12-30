"use client";

require("@solana/wallet-adapter-react-ui/styles.css");
import styles from "./walletconnect.module.css";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

/*
  The use of `next/dynamic` is necessary here because components from the
  @solana/wallet-adapter-react-ui library likely contain browser-specific code
  that is not executed during server-side rendering in Next.js. If these components
  undergo changes in their rendered output after being mounted on the client due
  to browser-specific code, it could result in errors.

  By employing `next/dynamic`, the WalletMultiButton component is deferred in its
  import and rendering until the client side. This strategy mitigates the
  server/client HTML mismatch issue that could arise from executing
  browser-specific code on the server. However, it's important to note
  that this approach may introduce a slight delay in rendering the
  WalletMultiButton component, as it only begins loading once the
  JavaScript for the page starts executing on the client.
*/

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false, loading: () => <p>wallet button loading...</p> }
);

const WalletDisconnectButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletDisconnectButton
    ),
  { ssr: false, loading: () => <p>wallet button loading...</p> }
);

export const WalletConnect = () => {
  const { publicKey, connect, disconnect } = useWallet();

  useEffect(() => {
    // @ts-ignore
    const provider = window.solana;

    if (provider) {
      const handleAccountChange = async (newPublicKey: any) => {
        console.log("provider -> ", provider);
        try {
          // Disconnect the current wallet session
          await disconnect();

          // Reconnect to the new account
          if (newPublicKey) {
            console.log(`Switched to account ${newPublicKey.toBase58()}`);

            // await connect();
            // console.log(`Switch successful`);
          }
        } catch (err) {
          console.error("Failed to connect to the new account:", err);
        }
      };

      provider.on("accountChanged", handleAccountChange);

      // Clean up the event listener when the component unmounts
      return () => {
        provider.removeListener("accountChanged", handleAccountChange);
      };
    }
  }, [disconnect, connect]);
  console.log(styles.walletConnectContainer);

  return (
    <div className={styles.container}>
      <div className={styles.button}>
        <WalletMultiButton />
      </div>
      <div className={styles.button}>
        <WalletDisconnectButton />
      </div>
    </div>
  );
};
