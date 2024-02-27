# <center>Solana Wallet Adapter </center>
![Wallets](wallets.png)

---
<!--PROJECT SHIELDS -->
<center>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

</center>

---

<!--PROJECT DESCRIPTION -->
<div>
    <p> The Solana Wallet Adapter (SWA) is a powerful toolkit designed to streamline the integration of Solana-based decentralized applications (dApps) with various wallet solutions. Developed and maintained by the Solana community, SWA offers a versatile set of modular TypeScript wallet adapters and components tailored specifically for Solana applications.</p>
    <p>At its core, SWA simplifies the process of connecting dApps with users' preferred wallets, offering seamless integration with over a dozen Solana wallets right out of the box. By leveraging SWA, developers can eliminate the complexities associated with individually supporting each wallet, thus enhancing accessibility and user experience. </p>
  
####Key features and benefits of SWA include: 
- Open Source and Solana Labs Support: SWA is an open-source project actively supported by Solana Labs, ensuring continuous improvement and community-driven development.
- Multi-Wallet Support: With SWA, developers can effortlessly accommodate users utilizing various Solana wallets, eliminating the need to manage multiple integrations separately.
- Customizable UI: SWA provides an off-the-shelf customizable user interface, enabling developers to tailor the wallet integration experience to align with the aesthetic and functional requirements of their dApps.
- Anchor Integration: SWA seamlessly integrates with Anchor, a comprehensive development framework for building Solana dApps, offering enhanced functionality and compatibility.
- Key Functionality: SWA offers essential functionalities such as Connect, Disconnect, and Auto-connect, streamlining the interaction between dApps and users' wallets.
- Support for Multiple Environment and Front-End Frameworks: SWA is designed to work seamlessly with various front-end frameworks and environment such as mobile and gaming development (unit), offering flexibility and compatibility across different development environments. 
 </div>



<!--PROJECT USE LINKS -->
<p align="center"> 
    <a href="#"><strong>View demo</strong> </a>
     ·
    <a href="#"><strong>Report bug</strong> </a>
    ·
    <a href="#/df"><strong>Request feature</strong> </a>
     ·
    <a href="#/df"><strong>FAQ</strong> </a>
</p>


<!--PROJECT TABLE OF CONTENTS -->

###Table of Contents 
 <ul>
    <li>
    Installation & Setup
    <ul>
    <li>
    <a href="#ReactJS"> ReactJS </a>
     </li>
     <li>
    <a href="https://github.com/lorisleiva/solana-wallets-vue"> VueJS </a>
     </li>
      <li>
    <a href="https://github.com/svelte-on-solana/wallet-adapter"> Svelte </a>
     </li>
      <li>
    <a href="https://github.com/magicblock-labs/Solana.Unity-SDK"> Unit-SDK </a>
     </li>
     </ul>
     </li>
      <li><a href="https://github.com/anza-xyz/wallet-adapter/blob/master/FAQ.md">FAQ</a></li>
      <li><a href="https://github.com/anza-xyz/wallet-adapter/blob/master/PACKAGES.md">Packages</a></li>
      <li><a href="https://github.com/anza-xyz/wallet-adapter/blob/master/BUILD.md">Build from source</a></li>
      <li><a href="#Resource">Resource</a></li>
    
  </ul>

##Installation & Setup
### ReactJS
<p>This is a quick setup guide with examples of how to add Wallet Adapter to a React-based Solana app. </p>

* Using NPM
   ```sh
 
    npm install --save  
    @solana/wallet-adapter-base 
    @solana/wallet-adapter-react 
    @solana/wallet-adapter-react-ui 
    @solana/wallet-adapter-wallets 
    @solana/web3.js 
  ```

* Using Yarn
   ```sh
 
    yarn add
    @solana/wallet-adapter-base 
    @solana/wallet-adapter-react 
    @solana/wallet-adapter-react-ui 
    @solana/wallet-adapter-wallets 
    @solana/web3.js 
  ```

* Setup
  ```sh
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

* Usage
  ```sh 
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

  <br>

###Create-Solana-Dapp  
 Instead of manual setup you can use the create-solana-dapp command to create a solana-dapp boilerplate that comes with the solana-wallet-adapter installation and configuration for your project.


 ```sh
 // Install 
 npm i create-solana-dapp

 // Create new solana-dapp project
 npx create-solana-dapp@latest
 ``` 
 [Learn more about create-solana-dapp](https://github.com/solana-developers/create-solana-dapp)

 ## Resource
- [Solana Documentation](https://solana.com/docs)
- [Solana Cookbook](https://solanacookbook.com/#contributing)
- [Solana dev course](https://www.soldev.app/course)





<!-- - [Demo](https://anza-xyz.github.io/wallet-adapter/example)
- [TypeScript Docs](https://anza-xyz.github.io/wallet-adapter/)
- [For Solana Apps](https://github.com/solana-labs/wallet-adapter/blob/master/APP.md)
- [For Solana Wallets](https://github.com/solana-labs/wallet-adapter/blob/master/WALLET.md)
- [Packages](https://github.com/solana-labs/wallet-adapter/blob/master/PACKAGES.md)
- [FAQ (Frequently Asked Questions)](https://github.com/solana-labs/wallet-adapter/blob/master/FAQ.md)
- [Build from Source](https://github.com/solana-labs/wallet-adapter/blob/master/BUILD.md) -->





<!-- MARKDOWN LINKS & ASSETS -->
[contributors-shield]: https://img.shields.io/github/contributors/anza-xyz/wallet-adapter?style=for-the-badge
[contributors-url]: https://github.com/anza-xyz/wallet-adapter/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/anza-xyz/wallet-adapter?style=for-the-badge
[forks-url]: https://github.com/anza-xyz/wallet-adapter/network/members
[stars-shield]: https://img.shields.io/github/stars/anza-xyz/wallet-adapter?style=for-the-badge
[stars-url]: https://github.com/anza-xyz/wallet-adapter/stargazers
[issues-shield]: https://img.shields.io/github/issues/anza-xyz/wallet-adapter?style=for-the-badge
[issues-url]: https://github.com/anza-xyz/wallet-adapter/issues
[license-shield]: https://img.shields.io/github/license/anza-xyz/wallet-adapter?style=for-the-badge
[license-url]: https://github.com/anza-xyz/wallet-adapter/blob/master/LICENSE