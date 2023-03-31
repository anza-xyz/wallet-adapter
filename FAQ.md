# FAQ (Frequently Asked Questions)

Please search https://solana.stackexchange.com and the issues in the repo. Issues are only for bug reports and feature requests.

- [FAQ (Frequently Asked Questions)](#faq-frequently-asked-questions)
  - [I am building an app, how do I use this?](#i-am-building-an-app-how-do-i-use-this)
  - [I am building a wallet, how do I use this?](#i-am-building-a-wallet-how-do-i-use-this)
  - [How can I get support?](#how-can-i-get-support)
  - [Can I use this with \_\_\_?](#can-i-use-this-with-___)
    - [React - including Next.js, Material UI, Ant Design, etc?](#react---including-nextjs-material-ui-ant-design-etc)
    - [Svelte, Vue, Angular, etc?](#svelte-vue-angular-etc)
    - [Anchor](#anchor)
    - [Webpack / Gatsby](#webpack--gatsby)
    - [Babel / Rollup / Vite / Snowpack / esbuild](#babel--rollup--vite--snowpack--esbuild)
  - [What does this error mean?](#what-does-this-error-mean)
    - [`Failed to compile. [...] Module not found: Can't resolve [...]`](#failed-to-compile--module-not-found-cant-resolve-)
    - [`[...] is not a function` / `[...] is undefined` / `Uncaught TypeError: Cannot destructure property` / `Uncaught (in promise) WalletNotConnectedError`](#-is-not-a-function---is-undefined--uncaught-typeerror-cannot-destructure-property--uncaught-in-promise-walletnotconnectederror)
    - [`[...] is not a function`](#-is-not-a-function)
  - [How can I sign and verify messages?](#how-can-i-sign-and-verify-messages)

## I am building an app, how do I use this?

See [./README.md#for-solana-dapp-developers].

## I am building a wallet, how do I use this?

See [./README.md#for-solana-wallet-app-developers].

## How can I get support?

Please ask questions on the [Solana Stack Exchange](https://solana.stackexchange.com).

After reading this FAQ, if you've found a bug or if you'd like to request a feature, please [open an issue](https://github.com/solana-labs/wallet-adapter/issues/new).

## Can I use this with ___?

### React - including Next.js, Material UI, Ant Design, etc?

Yes. See [./README.md#ui-components]

### Svelte, Vue, Angular, etc?

Yes. See [./README.md#community]
### Anchor
Yes, use the [`useAnchorWallet()`](https://github.com/solana-labs/wallet-adapter/blob/master/packages/core/react/src/useAnchorWallet.ts) hook in the React package to easily get an [Anchor-compatible Wallet interface](https://github.com/project-serum/anchor/blob/0faed886002a9b01ad0513c860e19d7570cb0221/ts/src/provider.ts#L220-L224).


### Webpack / Gatsby
Yes, but you may need to set up polyfills for certain imported modules.

For example, you may need to install `buffer`:
```shell
npm install --save buffer
```

And configure `webpack.config.js`:

```js
const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  resolve: {
    fallback: {
      crypto: false,
    },
  },
};
```

### Babel / Rollup / Vite / Snowpack / esbuild
Yes, but you may need to provide custom build configuration.
Most of the packages are built using the TypeScript compiler, which outputs modular ES6 with `import`/`export` statements.

If you're using Create React App, craco, or one of the React-based starter projects using them, this should be handled automatically.

If you're using Next.js, this requires configuration, which is provided in the [nextjs-starter](packages/starter/nextjs-starter) package.

If you're using something else, you may have to configure your build tool to transpile the packages similarly to how it's done in the Next.js config.
Please open an issue or pull request to document your solution!

## What does this error mean?

### `Failed to compile. [...] Module not found: Can't resolve [...]`

This can happen if you're cloning the project and [building it from the source](https://github.com/solana-labs/wallet-adapter/blob/master/README.md#build-from-source) and you missed a step.

If this doesn't fix the problem, please [open an issue](https://github.com/solana-labs/wallet-adapter/issues/new).

### `[...] is not a function` / `[...] is undefined` / `Uncaught TypeError: Cannot destructure property` / `Uncaught (in promise) WalletNotConnectedError`

This can happen if you don't wrap your app with the `WalletContext` and `ConnectionContext` provided by the [react](packages/core/react) package.
See issues [#62](https://github.com/solana-labs/wallet-adapter/issues/62#issuecomment-916421795), [#73](https://github.com/solana-labs/wallet-adapter/issues/73#issuecomment-919237687), and [#85](https://github.com/solana-labs/wallet-adapter/issues/85).

This shouldn't happen if you're using one of the starter projects, since they set up the contexts for you.

### `[...] is not a function`

This can happen if you try to use `signTransaction`, `signAllTransactions`, or `signMessage` without checking if they are defined first.

`sendTransaction` is the primary method that all wallets support, and it signs transactions.
The other methods are optional APIs, so you have to feature-detect them before using them.

Please see [issue #72](https://github.com/solana-labs/wallet-adapter/issues/72#issuecomment-919232595).

## How can I sign and verify messages?

Some wallet adapters provide a `signMessage` method for signing arbitrary bytes.

The signature string returned by this method can be verified using [tweetnacl-js](https://github.com/dchest/tweetnacl-js/blob/master/README.md#naclsigndetachedverifymessage-signature-publickey) using the public key from the adapter.

This can be used to sign offline — without sending a transaction — and prove a user controls a given private key.

```tsx
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import React, { FC, useCallback } from 'react';
import { sign } from 'tweetnacl';

export const SignMessageButton: FC = () => {
    const { publicKey, signMessage } = useWallet();

    const onClick = useCallback(async () => {
        try {
            // `publicKey` will be null if the wallet isn't connected
            if (!publicKey) throw new Error('Wallet not connected!');
            // `signMessage` will be undefined if the wallet doesn't support it
            if (!signMessage) throw new Error('Wallet does not support message signing!');

            // Encode anything as bytes
            const message = new TextEncoder().encode('Hello, world!');
            // Sign the bytes using the wallet
            const signature = await signMessage(message);
            // Verify that the bytes were signed using the private key that matches the known public key
            if (!sign.detached.verify(message, signature, publicKey.toBytes())) throw new Error('Invalid signature!');

            alert(`Message signature: ${bs58.encode(signature)}`);
        } catch (error: any) {
            alert(`Signing failed: ${error?.message}`);
        }
    }, [publicKey, signMessage]);

    return signMessage ? (<button onClick={onClick} disabled={!publicKey}>Sign Message</button>) : null;
};
```
