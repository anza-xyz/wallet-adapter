# FAQ (Frequently Asked Questions)

Please search https://solana.stackexchange.com and the issues in the repo. Issues are only for bug reports and feature requests.

- [I am building an app, how do I use this?](#i-am-building-an-app-how-do-i-use-this)
- [I am building a wallet, how do I use this?](#i-am-building-a-wallet-how-do-i-use-this)
- [How can I get support?](#how-can-i-get-support)
- [What does this error mean?](#what-does-this-error-mean)
- [How can I sign and verify messages?](#how-can-i-sign-and-verify-messages)

## I am building an app, how do I use this?

See the guide [Wallet Adapter for Solana Apps](https://github.com/anza-xyz/wallet-adapter/blob/master/APP.md).

## I am building a wallet, how do I use this?

See the guide [Wallet Adapter for Solana Wallets](https://github.com/anza-xyz/wallet-adapter/blob/master/WALLET.md).

## How can I get support?

Please ask questions on the [Solana Stack Exchange](https://solana.stackexchange.com).

After reading this FAQ, if you've found a bug or if you'd like to request a feature, please [open an issue](https://github.com/anza-xyz/wallet-adapter/issues/new).

## What does this error mean?

### `Failed to compile. [...] Module not found: Can't resolve [...]`

This can happen if you're cloning the project and [building it from the source](https://github.com/anza-xyz/wallet-adapter/blob/master/README.md#build-from-source) and you missed a step.

If this doesn't fix the problem, please [open an issue](https://github.com/anza-xyz/wallet-adapter/issues/new).

### `[...] is not a function` / `[...] is undefined` / `Uncaught TypeError: Cannot destructure property` / `Uncaught (in promise) WalletNotConnectedError`

This can happen if you don't wrap your app with the `WalletContext` and `ConnectionContext` provided by the [react](https://github.com/anza-xyz/wallet-adapter/tree/master/packages/core/react) package.
See issues [#62](https://github.com/anza-xyz/wallet-adapter/issues/62#issuecomment-916421795), [#73](https://github.com/anza-xyz/wallet-adapter/issues/73#issuecomment-919237687), and [#85](https://github.com/anza-xyz/wallet-adapter/issues/85).

This shouldn't happen if you're using one of the starter projects, since they set up the contexts for you.

### `[...] is not a function`

This can happen if you try to use `signTransaction`, `signAllTransactions`, or `signMessage` without checking if they are defined first.

`sendTransaction` is the primary method that all wallets support, and it signs transactions.
The other methods are optional APIs, so you have to feature-detect them before using them.

Please see [issue #72](https://github.com/anza-xyz/wallet-adapter/issues/72#issuecomment-919232595).
