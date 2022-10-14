# Wallet Adapter for Solana Wallets

## Notice to Wallet Adapter contributors

Support for [Mobile Wallet Adapter](https://github.com/solana-mobile/mobile-wallet-adapter) and the [Wallet Standard](https://github.com/wallet-standard/wallet-standard) has been added directly into Wallet Adapter.

We are no longer accepting PRs specifically for wallet adapters for _**mobile app wallets**_ or _**injected browser wallets**_ in this repo.

This means any wallet embedded in a mobile app, webview, browser, or browser extension.

If you have built this kind of wallet, you no longer need to publish an adapter at all.

Instead, check out the [reference implementations of Standard wallets](https://github.com/wallet-standard/wallet-standard/tree/master/packages/wallets) here.

These are just reference implementations — you don't need to open a PR to Mobile Wallet Adapter or the Wallet Standard.

You can implement these interfaces in your wallet, and your wallet will work across Solana apps.

While adapters are no longer needed for these wallets, if you still wish to publish one, consider self-publishing a package on npm.
