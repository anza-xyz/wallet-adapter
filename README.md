# `@solana/wallet-adapter`

TypeScript wallet adapters and components for Solana applications.

<!-- TODO -->

## Quick Links

- [Docs](https://solana-labs.github.io/wallet-adapter/)
- [Example](https://solana-labs.github.io/wallet-adapter/example/)

## Packages

| package                                                                                                       | description                                                                 | npm                                                                                                                      | version |
|---------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|---------|
| [wallets](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets)                         | All wallets with icons                                                      | [`@solana/wallet-adapter-wallets`](https://www.npmjs.com/package/@solana/wallet-adapter-wallets)                         | `0.4.0` |
| [react](https://github.com/solana-labs/wallet-adapter/tree/master/packages/react)                             | React hooks and context for dApps                                           | [`@solana/wallet-adapter-react`](https://www.npmjs.com/package/@solana/wallet-adapter-react)                             | `0.4.0` |
| [base](https://github.com/solana-labs/wallet-adapter/tree/master/packages/base)                               | Adapter interface, errors, and utilities                                    | [`@solana/wallet-adapter-base`](https://www.npmjs.com/package/@solana/wallet-adapter-base)                               | `0.4.0` |
| [phantom](https://github.com/solana-labs/wallet-adapter/tree/master/packages/phantom)                         | Adapter for [Phantom](https://www.phantom.app)                              | [`@solana/wallet-adapter-phantom`](https://www.npmjs.com/package/@solana/wallet-adapter-phantom)                         | `0.4.0` |
| [torus](https://github.com/solana-labs/wallet-adapter/tree/master/packages/torus)                             | Adapter for [Torus](https://tor.us)                                         | [`@solana/wallet-adapter-torus`](https://www.npmjs.com/package/@solana/wallet-adapter-torus)                             | `0.4.0` |
| [ledger](https://github.com/solana-labs/wallet-adapter/tree/master/packages/ledger)                           | Adapter for [Ledger](https://www.ledger.com)                                | [`@solana/wallet-adapter-ledger`](https://www.npmjs.com/package/@solana/wallet-adapter-ledger)                           | `0.4.0` |
| [solong](https://github.com/solana-labs/wallet-adapter/tree/master/packages/solong)                           | Adapter for [Solong](https://solongwallet.com)                              | [`@solana/wallet-adapter-solong`](https://www.npmjs.com/package/@solana/wallet-adapter-solong)                           | `0.4.0` |
| [mathwallet](https://github.com/solana-labs/wallet-adapter/tree/master/packages/mathwallet)                   | Adapter for [MathWallet](https://mathwallet.org)                            | [`@solana/wallet-adapter-mathwallet`](https://www.npmjs.com/package/@solana/wallet-adapter-mathwallet)                   | `0.4.0` |
| [sollet](https://github.com/solana-labs/wallet-adapter/tree/master/packages/sollet)                           | Adapter for [Sollet](https://www.sollet.io)                                 | [`@solana/wallet-adapter-sollet`](https://www.npmjs.com/package/@solana/wallet-adapter-sollet)                           | `0.4.0` |
| [material-ui](https://github.com/solana-labs/wallet-adapter/tree/master/packages/material-ui)                 | Components for [Material UI](https://material-ui.com)                       | [`@solana/wallet-adapter-material-ui`](https://www.npmjs.com/package/@solana/wallet-adapter-material-ui)                 | `0.4.0` |
| [material-ui-starter](https://github.com/solana-labs/wallet-adapter/tree/master/packages/material-ui-starter) | [Create React App](https://create-react-app.dev/) project using Material UI | [`@solana/wallet-adapter-material-ui-starter`](https://www.npmjs.com/package/@solana/wallet-adapter-material-ui-starter) | `0.1.0` |
| [example](https://github.com/solana-labs/wallet-adapter/tree/master/packages/example)                         | Demo of components                                                          | [`@solana/wallet-adapter-example`](https://www.npmjs.com/package/@solana/wallet-adapter-example)                         | `0.4.0` |

## Quick Setup (using React with Material UI)

See the [material-ui-starter](https://github.com/solana-labs/wallet-adapter/tree/master/packages/material-ui-starter) package for a more complete example.

### Install

Install these peer dependencies (or skip this if you have them already):
```shell
yarn add @material-ui/core \
         @material-ui/icons \
         @solana/web3.js \
         react
```

Install these dependencies:
```shell
yarn add @solana/wallet-adapter-wallets \
         @solana/wallet-adapter-react \
         @solana/wallet-adapter-material-ui \
         @solana/wallet-adapter-base
```

### Code

```tsx
import React, { FC, useMemo } from 'react';
import { WalletProvider } from '@solana/wallet-adapter-react';
import {
    getLedgerWallet,
    getMathWallet,
    getPhantomWallet,
    getSolletWallet,
    getSolongWallet,
    getTorusWallet,
} from '@solana/wallet-adapter-wallets';
import {
    WalletDialogProvider,
    WalletDisconnectButton,
    WalletMultiButton,
} from '@solana/wallet-adapter-material-ui';

export const Wallet: FC = () => {
    // @solana/wallet-adapter-wallets imports all the adapters but supports tree shaking --
    // Only the wallets you want to support will be compiled into your application
    const wallets = useMemo(() => [
        getPhantomWallet(),
        getLedgerWallet(),
        getTorusWallet({ clientId: 'Go to https://developer.tor.us and create a client ID' }),
        getSolongWallet(),
        getMathWallet(),
        getSolletWallet(),
    ], []);

    return (
        <WalletProvider wallets={wallets} autoConnect>
            <WalletDialogProvider>
                <WalletMultiButton/>
                <WalletDisconnectButton/>
            </WalletDialogProvider>
        </WalletProvider>
    );
};
```
