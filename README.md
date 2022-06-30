# `@solana/wallet-adapter`

Modular TypeScript wallet adapters and components for Solana applications.

![Wallets](wallets.png)

## Quick Links

- [Demo](https://solana-labs.github.io/wallet-adapter/example/)
- [TypeScript Docs](https://solana-labs.github.io/wallet-adapter/)
- [FAQ (Frequently Asked Questions)](https://github.com/solana-labs/wallet-adapter/blob/master/FAQ.md)
    + [How can I get support?](https://github.com/solana-labs/wallet-adapter/blob/master/FAQ.md#how-can-i-get-support)
    + [Can I use this with ___?](https://github.com/solana-labs/wallet-adapter/blob/master/FAQ.md#can-i-use-this-with-___)
    + [What does this error mean?](https://github.com/solana-labs/wallet-adapter/blob/master/FAQ.md#what-does-this-error-mean)
    + [How can I sign and verify messages?](https://github.com/solana-labs/wallet-adapter/blob/master/FAQ.md#how-can-i-sign-and-verify-messages)
- [Quick Setup (using React UI)](#quick-setup-using-react-ui)
    + [Install](#install)
    + [Setup](#setup)
    + [Usage](#usage)
- [Packages](#packages)
    + [Core](#core)
    + [Wallets](#wallets)
    + [UI Components](#ui-components)
    + [Starter Projects](#starter-projects)
    + [Community](#community)
- [Build from Source](#build-from-source)

## Quick Setup (using React UI)

There are also [material-ui](https://github.com/solana-labs/wallet-adapter/tree/master/packages/ui/material-ui) and [ant-design](https://github.com/solana-labs/wallet-adapter/tree/master/packages/ui/ant-design) packages if you use those component frameworks.

### Install

Install these dependencies:

```shell
yarn add @solana/wallet-adapter-base \
         @solana/wallet-adapter-react \
         @solana/wallet-adapter-react-ui \
         @solana/wallet-adapter-wallets \
         @solana/web3.js \
         @solana-mobile/wallet-adapter-mobile \
         react
```

### Setup

```tsx
import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    CoinbaseWalletAdapter,
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { createDefaultAuthorizationResultCache, SolanaMobileWalletAdapter } from '@solana-mobile/wallet-adapter-mobile';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

export const Wallet: FC = () => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            new SolanaMobileWalletAdapter({
                appIdentity: { name: 'Solana Wallet Adapter App' },
                authorizationResultCache: createDefaultAuthorizationResultCache(),
            }),
            new CoinbaseWalletAdapter(),
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
        ],
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

### Usage

```tsx
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import React, { FC, useCallback } from 'react';

export const SendOneLamportToRandomAddress: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const onClick = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: Keypair.generate().publicKey,
                lamports: 1,
            })
        );

        const signature = await sendTransaction(transaction, connection);

        await connection.confirmTransaction(signature, 'processed');
    }, [publicKey, sendTransaction, connection]);

    return (
        <button onClick={onClick} disabled={!publicKey}>
            Send 1 lamport to a random address!
        </button>
    );
};
```

## Packages
This library is organized into small packages with few dependencies.
To add it to your dApp, you'll need core packages, some wallets, and UI components for your chosen framework.

### Core
These packages are what most projects can use to support wallets on Solana.

| package                                                                                | description                                           | npm                                                                                      |
|----------------------------------------------------------------------------------------|-------------------------------------------------------|------------------------------------------------------------------------------------------|
| [base](https://github.com/solana-labs/wallet-adapter/tree/master/packages/core/base)   | Adapter interfaces, error types, and common utilities | [`@solana/wallet-adapter-base`](https://npmjs.com/package/@solana/wallet-adapter-base)   |
| [react](https://github.com/solana-labs/wallet-adapter/tree/master/packages/core/react) | Contexts and hooks for React dApps                    | [`@solana/wallet-adapter-react`](https://npmjs.com/package/@solana/wallet-adapter-react) |

### Wallets
These packages provide adapters for each wallet.
You can use the [wallets](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/wallets) package, or add the individual wallet packages you want.

| package                                                                                               | description                                           | npm                                                                                                  |
|-------------------------------------------------------------------------------------------------------|-------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| [wallets](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/wallets)         | Includes all the wallets (with tree shaking)          | [`@solana/wallet-adapter-wallets`](https://npmjs.com/package/@solana/wallet-adapter-wallets)         |
| [bitkeep](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/bitkeep)         | Adapter for [BitKeep](https://bitkeep.com)            | [`@solana/wallet-adapter-bitkeep`](https://npmjs.com/package/@solana/wallet-adapter-bitkeep)         |
| [bitpie](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/bitpie)           | Adapter for [Bitpie](https://bitpie.com)              | [`@solana/wallet-adapter-bitpie`](https://npmjs.com/package/@solana/wallet-adapter-bitpie)           |
| [blocto](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/blocto)           | Adapter for [Blocto](https://blocto.app)              | [`@solana/wallet-adapter-blocto`](https://npmjs.com/package/@solana/wallet-adapter-blocto)           |
| [brave](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/brave)             | Adapter for [Brave](https://brave.com/wallet)         | [`@solana/wallet-adapter-brave`](https://npmjs.com/package/@solana/wallet-adapter-brave)             |
| [clover](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/clover)           | Adapter for [Clover](https://clover.finance)          | [`@solana/wallet-adapter-clover`](https://npmjs.com/package/@solana/wallet-adapter-clover)           |
| [coin98](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/coin98)           | Adapter for [Coin98](https://coin98.com)              | [`@solana/wallet-adapter-coin98`](https://npmjs.com/package/@solana/wallet-adapter-coin98)           |
| [coinbase](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/coinbase)       | Adapter for [Coinbase](https://www.coinbase.com)      | [`@solana/wallet-adapter-coinbase`](https://npmjs.com/package/@solana/wallet-adapter-coinbase)       |
| [coinhub](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/coinhub)         | Adapter for [Coinhub](https://coinhub.org)            | [`@solana/wallet-adapter-coinhub`](https://npmjs.com/package/@solana/wallet-adapter-coinhub)         |
| [exodus](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/exodus)           | Adapter for [Exodus](https://exodus.com)              | [`@solana/wallet-adapter-exodus`](https://npmjs.com/package/@solana/wallet-adapter-exodus)           |
| [glow](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/glow)               | Adapter for [Glow](https://glow.app)                  | [`@solana/wallet-adapter-glow`](https://npmjs.com/package/@solana/wallet-adapter-glow)               |
| [huobi](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/huobi)             | Adapter for [HuobiWallet](https://www.huobiwallet.io) | [`@solana/wallet-adapter-huobi`](https://npmjs.com/package/@solana/wallet-adapter-huobi)             |
| [hyperpay](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/hyperpay)       | Adapter for [HyperPay](https://hyperpay.io)           | [`@solana/wallet-adapter-hyperpay`](https://npmjs.com/package/@solana/wallet-adapter-hyperpay)       |
| [ledger](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/ledger)           | Adapter for [Ledger](https://ledger.com)              | [`@solana/wallet-adapter-ledger`](https://npmjs.com/package/@solana/wallet-adapter-ledger)           |
| [mathwallet](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/mathwallet)   | Adapter for [MathWallet](https://mathwallet.org)      | [`@solana/wallet-adapter-mathwallet`](https://npmjs.com/package/@solana/wallet-adapter-mathwallet)   |
| [neko](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/neko)               | Adapter for [Neko](https://nekowallet.com)            | [`@solana/wallet-adapter-neko`](https://npmjs.com/package/@solana/wallet-adapter-neko)               |
| [nightly](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/nightly)         | Adapter for [Nightly](https://nightly.app)            | [`@solana/wallet-adapter-nightly`](https://npmjs.com/package/@solana/wallet-adapter-nightly)         |
| [nufi](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/nufi)               | Adapter for [NuFi](https://nu.fi)                     | [`@solana/wallet-adapter-nufi`](https://npmjs.com/package/@solana/wallet-adapter-nufi)               |
| [phantom](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/phantom)         | Adapter for [Phantom](https://phantom.app)            | [`@solana/wallet-adapter-phantom`](https://npmjs.com/package/@solana/wallet-adapter-phantom)         |
| [safepal](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/safepal)         | Adapter for [SafePal](https://safepal.io)             | [`@solana/wallet-adapter-safepal`](https://npmjs.com/package/@solana/wallet-adapter-safepal)         |
| [saifu](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/saifu)             | Adapter for [Saifu](https://saifuwallet.com)          | [`@solana/wallet-adapter-saifu`](https://npmjs.com/package/@solana/wallet-adapter-safepal)           |
| [sky](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/sky)                 | Adapter for [Sky](https://getsky.app)                 | [`@solana/wallet-adapter-sky`](https://npmjs.com/package/@solana/wallet-adapter-sky)                 |
| [slope](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/slope)             | Adapter for [Slope](https://slope.finance)            | [`@solana/wallet-adapter-slope`](https://npmjs.com/package/@solana/wallet-adapter-slope)             |
| [solflare](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/solflare)       | Adapter for [Solflare](https://solflare.com)          | [`@solana/wallet-adapter-solflare`](https://npmjs.com/package/@solana/wallet-adapter-solflare)       |
| [sollet](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/sollet)           | Adapter for [Sollet](https://www.sollet.io)           | [`@solana/wallet-adapter-sollet`](https://npmjs.com/package/@solana/wallet-adapter-sollet)           |
| [solong](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/solong)           | Adapter for [Solong](https://solongwallet.com)        | [`@solana/wallet-adapter-solong`](https://npmjs.com/package/@solana/wallet-adapter-solong)           |
| [tokenpocket](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/tokenpocket) | Adapter for [TokenPocket](https://tokenpocket.pro)    | [`@solana/wallet-adapter-tokenpocket`](https://npmjs.com/package/@solana/wallet-adapter-tokenpocket) |
| [torus](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/torus)             | Adapter for [Torus](https://tor.us)                   | [`@solana/wallet-adapter-torus`](https://npmjs.com/package/@solana/wallet-adapter-torus)             |

### UI Components
These packages provide components for common UI frameworks.

| package                                                                                                   | description                                                        | npm                                                                                                        |
|-----------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| [react-ui](https://github.com/solana-labs/wallet-adapter/tree/master/packages/ui/react-ui)                | Components for React (no UI framework, just CSS)                   | [`@solana/wallet-adapter-react-ui`](https://npmjs.com/package/@solana/wallet-adapter-react-ui)             |
| [material-ui](https://github.com/solana-labs/wallet-adapter/tree/master/packages/ui/material-ui)          | Components for [Material UI](https://material-ui.com) with React   | [`@solana/wallet-adapter-material-ui`](https://npmjs.com/package/@solana/wallet-adapter-material-ui)       |
| [ant-design](https://github.com/solana-labs/wallet-adapter/tree/master/packages/ui/ant-design)            | Components for [Ant Design](https://ant.design) with React         | [`@solana/wallet-adapter-ant-design`](https://npmjs.com/package/@solana/wallet-adapter-ant-design)         |
| [angular-material-ui](https://github.com/heavy-duty/platform/tree/master/libs/wallet-adapter/ui/material) | Components for [Angular Material UI](https://material.angular.io/) | [`@heavy-duty/wallet-adapter-material`](https://www.npmjs.com/package/@heavy-duty/wallet-adapter-material) |

### Starter Projects
These packages provide projects that you can use to start building a dApp with built-in wallet support.
Alternatively, check out [solana-dapp-next](https://github.com/lisenmayben/solana-dapp-next) for a more complete framework.

| package                                                                                                                         | description                                                             | npm                                                                                                                            |
|---------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| [example](https://github.com/solana-labs/wallet-adapter/tree/master/packages/starter/example)                                   | Demo of UI components and wallets                                       | [`@solana/wallet-adapter-example`](https://npmjs.com/package/@solana/wallet-adapter-example)                                   |
| [create-react-app-starter](https://github.com/solana-labs/wallet-adapter/tree/master/packages/starter/create-react-app-starter) | [Create React App](https://create-react-app.dev) project using React UI | [`@solana/wallet-adapter-create-react-app-starter`](https://npmjs.com/package/@solana/wallet-adapter-create-react-app-starter) |
| [material-ui-starter](https://github.com/solana-labs/wallet-adapter/tree/master/packages/starter/material-ui-starter)           | [Parcel](https://parceljs.org) project using Material UI                | [`@solana/wallet-adapter-material-ui-starter`](https://npmjs.com/package/@solana/wallet-adapter-material-ui-starter)           |
| [react-ui-starter](https://github.com/solana-labs/wallet-adapter/tree/master/packages/starter/react-ui-starter)                 | [Parcel](https://parceljs.org) project using React UI                   | [`@solana/wallet-adapter-react-ui-starter`](https://npmjs.com/package/@solana/wallet-adapter-react-ui-starter)                 |
| [nextjs-starter](https://github.com/solana-labs/wallet-adapter/tree/master/packages/starter/nextjs-starter)                     | [Next.js](https://nextjs.org) project using React UI                    | [`@solana/wallet-adapter-nextjs-starter`](https://npmjs.com/package/@solana/wallet-adapter-nextjs-starter)                     |

### Community
Several packages are maintained by the community to support additional frontend frameworks.

- [Vue](https://github.com/lorisleiva/solana-wallets-vue)
- [Angular](https://github.com/heavy-duty/platform/tree/master/libs/wallet-adapter)
- [Svelte](https://github.com/svelte-on-solana/wallet-adapter)

## Build from Source

1. Clone the project:
```shell
git clone https://github.com/solana-labs/wallet-adapter.git
```

2. Install dependencies:
```shell
cd wallet-adapter
yarn install
```

3. Build all packages:
```shell
yarn build
```

4. Run locally:
```shell
cd packages/starter/react-ui-starter
yarn start
```
