# `@solana/wallet-adapter`

TypeScript wallet adapters and components for Solana applications.

<!-- TODO -->

## Quick Links

- [Docs](https://solana-labs.github.io/wallet-adapter/)
- [Example](https://solana-labs.github.io/wallet-adapter/example/)


## Quick Setup (using React with Material UI)

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
yarn add \
         # Wallets to use
         @solana/wallet-adapter-wallets \
         # React hooks and context for wallets
         @solana/wallet-adapter-react \
         # Simple components for connecting a wallet
         @solana/wallet-adapter-material-ui
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
    WalletConnectButton,
    WalletDialogProvider,
    WalletDisconnectButton,
    WalletMultiButton,
} from '@solana/wallet-adapter-material-ui';

export const Wallet: FC = () => {
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

## Packages

| npm                                                                                                      | version | code                                                                                                   |
|----------------------------------------------------------------------------------------------------------|---------|--------------------------------------------------------------------------------------------------------|
| [`@solana/wallet-adapter-wallets`](https://www.npmjs.com/package/@solana/wallet-adapter-wallets)         | `0.2.0` | [packages/wallets](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets)         |
| [`@solana/wallet-adapter-react`](https://www.npmjs.com/package/@solana/wallet-adapter-react)             | `0.2.0` | [packages/react](https://github.com/solana-labs/wallet-adapter/tree/master/packages/react)             |
| [`@solana/wallet-adapter-base`](https://www.npmjs.com/package/@solana/wallet-adapter-base)               | `0.2.0` | [packages/base](https://github.com/solana-labs/wallet-adapter/tree/master/packages/base)               |
| [`@solana/wallet-adapter-torus`](https://www.npmjs.com/package/@solana/wallet-adapter-torus)             | `0.2.0` | [packages/torus](https://github.com/solana-labs/wallet-adapter/tree/master/packages/torus)             |
| [`@solana/wallet-adapter-ledger`](https://www.npmjs.com/package/@solana/wallet-adapter-ledger)           | `0.2.0` | [packages/ledger](https://github.com/solana-labs/wallet-adapter/tree/master/packages/ledger)           |
| [`@solana/wallet-adapter-sollet`](https://www.npmjs.com/package/@solana/wallet-adapter-sollet)           | `0.2.0` | [packages/sollet](https://github.com/solana-labs/wallet-adapter/tree/master/packages/sollet)           |
| [`@solana/wallet-adapter-phantom`](https://www.npmjs.com/package/@solana/wallet-adapter-phantom)         | `0.2.0` | [packages/phantom](https://github.com/solana-labs/wallet-adapter/tree/master/packages/phantom)         |
| [`@solana/wallet-adapter-solong`](https://www.npmjs.com/package/@solana/wallet-adapter-solong)           | `0.2.0` | [packages/solong](https://github.com/solana-labs/wallet-adapter/tree/master/packages/solong)           |
| [`@solana/wallet-adapter-mathwallet`](https://www.npmjs.com/package/@solana/wallet-adapter-mathwallet)   | `0.2.0` | [packages/mathwallet](https://github.com/solana-labs/wallet-adapter/tree/master/packages/mathwallet)   |
| [`@solana/wallet-adapter-material-ui`](https://www.npmjs.com/package/@solana/wallet-adapter-material-ui) | `0.2.0` | [packages/material-ui](https://github.com/solana-labs/wallet-adapter/tree/master/packages/material-ui) |
| [`@solana/wallet-adapter-example`](https://www.npmjs.com/package/@solana/wallet-adapter-example)         | `0.2.0` | [packages/example](https://github.com/solana-labs/wallet-adapter/tree/master/packages/example)         |
