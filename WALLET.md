# Wallet Adapter for Solana Wallets

Support for [Mobile Wallet Adapter](https://github.com/solana-mobile/mobile-wallet-adapter) and the [Wallet Standard](https://github.com/wallet-standard/wallet-standard) has been added directly into Wallet Adapter.

For any wallet embedded in a browser, browser extension, or mobile app, you no longer need to publish an adapter at all.

Instead, check out the [reference implementations of Standard wallets](https://github.com/wallet-standard/wallet-standard/tree/master/packages/wallets).

These are just reference implementations — you don't need to open a PR to Mobile Wallet Adapter or the Wallet Standard.

You can implement these protocols in your wallet, and your wallet will work across Solana apps.

As wallets continue to add support for these protocols, the adapters for these wallets will be deprecated.

Bug fixes to existing adapters are welcome, but new features should be implemented using Mobile Wallet Adapter and Wallet Standard interfaces.

We are no longer accepting contributions for new adapters of this type, and all existing adapters of this type will eventually be deprecated.
