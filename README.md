# Solana Wallet Adapter
![Wallets](wallets.png)

<!--PROJECT DESCRIPTION -->

 The Solana Wallet Adapter is a powerful toolkit designed to streamline the integration of Solana-based decentralized applications (dApps) with various wallet solutions. Developed and maintained by the Solana community and Anza, wallet-adapter offers a versatile set of modular TypeScript wallet adapters and components tailored specifically for Solana applications.
 At its core, wallet-adapter simplifies the process of connecting dApps with users' preferred wallets, offering seamless integration with over a dozen Solana wallets right out of the box. By leveraging wallet-adapter, developers can eliminate the complexities associated with individually supporting each wallet, thus enhancing accessibility and user experience. 

  
## Features and benefits of wallet-adapter: 
- Open Source and Anza Support: wallet-adapter is an open-source project actively supported by Anza, ensuring continuous improvement and community-driven development.
- Multi-Wallet Support: With wallet-adapter, developers can effortlessly accommodate users utilizing various Solana wallets, eliminating the need to manage multiple integrations separately.
- Customizable UI: wallet-adapter provides an off-the-shelf customizable user interface, enabling developers to tailor the wallet integration experience to align with the aesthetic and functional requirements of their dApps.
- Anchor Integration: wallet-adapter seamlessly integrates with Anchor, a comprehensive development framework for building Solana dApps, offering enhanced functionality and compatibility.
- Key Functionality: wallet-adapter offers essential functionalities such as Connect, Disconnect, and Auto-connect, streamlining the interaction between dApps and users' wallets.
- Support for Multiple Environment and Front-End Frameworks: wallet-adapter is designed to work seamlessly with various front-end frameworks and environment such as mobile and gaming development (unity), offering flexibility and compatibility across different development environments. 



<!--PROJECT TABLE OF CONTENTS -->

## Useful Links
<!--PROJECT USE LINKS -->
* [Demo](https://anza-xyz.github.io/wallet-adapter/example/)
* [Typescript Docs](https://anza-xyz.github.io/wallet-adapter/)
* [For Solana Apps](https://github.com/anza-xyz/wallet-adapter/blob/master/APP.md)
* [For Solana Wallets](https://github.com/anza-xyz/wallet-adapter/blob/master/WALLET.md)
* [Packages](https://github.com/anza-xyz/wallet-adapter/blob/master/PACKAGES.md)
* [Build from Source](https://github.com/anza-xyz/wallet-adapter/blob/master/BUILD.md)
* [Report bug](https://github.com/anza-xyz/wallet-adapter/issues)
* [Faq](https://github.com/anza-xyz/wallet-adapter/blob/master/FAQ.md)


## Installation & Setup
### Create-react-app
<p>This is a quick setup guide with examples of how to add Wallet Adapter to a React-based Solana app. </p>

#### Using NPM
   ```tsx
 
    npm install --save  
    @solana/wallet-adapter-base 
    @solana/wallet-adapter-react 
    @solana/wallet-adapter-react-ui 
    @solana/wallet-adapter-wallets 
    @solana/web3.js 
  ```

#### Using Yarn
   ```tsx 

    yarn add
    @solana/wallet-adapter-base 
    @solana/wallet-adapter-react 
    @solana/wallet-adapter-react-ui 
    @solana/wallet-adapter-wallets 
    @solana/web3.js 
  ```

#### Setup
  ```tsx
    import React, { FC, useMemo } from 'react';
    import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
    import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
    import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
    import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
    } from '@solana/wallet-adapter-react-ui';
    import { clusterApiUrl } from '@solana/web3.js';

    // Default styles that can be overridden by your app
    require('@solana/wallet-adapter-react-ui/styles.css');

    export const Wallet: FC = () => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            /**
             * Wallets that implement either of these standards will be available automatically.
             *
             *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
             *     (https://github.com/solana-mobile/mobile-wallet-adapter)
             *   - Solana Wallet Standard
             *     (https://github.com/solana-labs/wallet-standard)
             *
             * If you wish to support a wallet that supports neither of those standards,
             * instantiate its legacy wallet adapter here. Common legacy adapters can be found
             * in the npm package `@solana/wallet-adapter-wallets`.
             */
            new UnsafeBurnerWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <WalletMultiButton />
                    <WalletDisconnectButton />
                    { /* Your app's components go here, nested within the context providers. */ }
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
    };
  ```

#### Usage
  ```tsx

  import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
    import { useConnection, useWallet } from '@solana/wallet-adapter-react';
    import { Keypair, SystemProgram, Transaction } from '@solana/web3.js';
    import React, { FC, useCallback } from 'react';

    export const SendSOLToRandomAddress: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const onClick = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();

        // 890880 lamports as of 2022-09-01
        const lamports = await connection.getMinimumBalanceForRentExemption(0);

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: Keypair.generate().publicKey,
                lamports,
            })
        );

        const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight }
        } = await connection.getLatestBlockhashAndContext();

        const signature = await sendTransaction(transaction, connection, { minContextSlot });

        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
    }, [publicKey, sendTransaction, connection]);

    return (
        <button onClick={onClick} disabled={!publicKey}>
            Send SOL to a random address!
        </button>
    );
    };
  ```


### Create-Solana-Dapp  
 Instead of manual setup you can use the create-solana-dapp command to create a solana-dapp boilerplate that comes with the solana-wallet-adapter installation and configuration for your project.


 ```tsx

 // Install 
 npm i create-solana-dapp

 // Create new solana-dapp project
 npx create-solana-dapp@latest
 ``` 
### VueJs 
Install and setup solana-wallet-adapter in your Vue3 projects.

#### Using NPM

```tsx
npm install solana-wallets-vue @solana/wallet-adapter-wallets

```
#### Using Yarn

```tsx
yarn add solana-wallets-vue @solana/wallet-adapter-wallets

```

#### Setup
```tsx 
import { createApp } from "vue";
import App from "./App.vue";
import SolanaWallets from "solana-wallets-vue";

// You can either import the default styles or create your own.
import "solana-wallets-vue/styles.css";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import {
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

const walletOptions = {
  wallets: [
    new PhantomWalletAdapter(),
    new SlopeWalletAdapter(),
    new SolflareWalletAdapter({ network: WalletAdapterNetwork.Devnet }),
  ],
  autoConnect: true,
};

createApp(App).use(SolanaWallets, walletOptions).mount("#app");
```

#### Usage

Go to the official VueJs community docs
[Learn more](https://github.com/lorisleiva/solana-wallets-vue)


 [Learn more about create-solana-dapp](https://github.com/solana-developers/create-solana-dapp)

## Resource
- [Solana Documentation](https://solana.com/docs)
- [Solana Cookbook](https://solanacookbook.com/#contributing)
- [Solana dev course](https://www.soldev.app/course)

