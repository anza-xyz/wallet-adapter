# `@solana/wallet-adapter-svelte-ui`

Pre-built components for integrating with web3 wallets using Svelte

## Getting Started

The UI components need to be installed into a project that is already set up with `@solana/web3.js` and the base wallet adapters. Therefore, it cannot work standalone.

During this process, you will:

- 📦 Install the base wallet adapters
- 📦 Install the svelte adapter and svelte UI
- 🔨 Add the `ConnectionProvider` (`AnchorConnectionProvider` if you're using Anchor)
- 🔨 Add the `WalletProvider` component
- 🔨 Add the `WalletMultiButton` component

## Installing

> Run these commands from your **applications** root directory

Install the base wallet adapters

```shell
npm i @solana/wallet-adapter-wallets \
      @solana/wallet-adapter-base \
      @solana/wallet-adapter-svelte \
      @solana/web3.js
```

Install the UI components

```shell
npm i @solana/wallet-adapter-svelte-ui
```

## Set Up

There are three components that you need to get set up:

- `WalletProvider`
- `ConnectionProvider` (`AnchorConnectionProvicer` if you're using Anchor)
- `WalletMultiButton`

### `WalletProvider`

`WalletProvider` is a component used to initialize four wallet stores and add event listeners ...

The four wallet stores:

- `walletConfigStore` - Contains the config
- `walletStore` - Contains the connected wallet
- `walletNameStore` - Contains the name of the connected wallet
- `walletAdapterStore` - Contains the adapter of the connected wallet

#### API

| prop | type | default |
| ---- | -----| --------|
| localStorageKey? | `string` | `'walletAdapter'`     |
| wallets | `Wallets[]` |    |
| autoConnect? | `boolean` | `false`     |

#### Usage

```html
<script lang="ts">
    import { onMount } from 'svelte';
    import WalletProvider from '@solana/wallet-adapter-svelte';

    const localStorageKey = 'walletAdapter';

    let wallets;

    onMount(async () => {
        const { getPhantomWallet, getSlopeWallet, getSolflareWallet } = await import(
            '@solana/wallet-adapter-wallets'
        );
        const walletsMap = [getPhantomWallet(), getSlopeWallet(), getSolflareWallet()];
        wallets = walletsMap;
    });
</script>

<WalletProvider {localStorageKey} {wallets} autoConnect />
```

### `ConnectionProvider`

`ConnectionProvider` is a component used to ...

#### API

| prop | type | default |
| ---- | ---- | ------- |
| network | `string` |      |

#### Usage

```html
<script lang="ts">
    import { clusterApiUrl } from '@solana/web3.js';
    import ConnectionProvider from '@solana/wallet-adapter-svelte';

    const network = clusterApiUrl('devnet');
</script>

<ConnectionProvider {network} />
```

### `AnchorConnectionProvider`

`AnchorConnectionProvider` is a component used to ...

#### API

| prop | type | default |
| ---- | ---- | ------- |
| network | `string` |      |
| idl  | `Idl` |    |


#### Usage

```html
<script lang="ts">
    import { clusterApiUrl } from '@solana/web3.js';
    import AnchorConnectionProvider from '@solana/wallet-adapter-svelte';

    const network = clusterApiUrl('devnet');
</script>

<AnchorConnectionProvider {network} {idl} />
```

### `WalletMultiButton`

`WalletMultiButton` is a component used as the entry point to connect/disconnect a wallet.

#### Usage

```html
<script lang="ts">
    import WalletMultiButton from '@solana/wallet-adapter-svelte-ui';
</script>

<WalletMultiButton />
```

## Example Implementation

See example implementations of the `@solana/wallet-adapter-svelte-ui` library.

- [Solana svelte counter][1]

[1]: https://github.com/silvestrevivo/solana-svelte-counter

