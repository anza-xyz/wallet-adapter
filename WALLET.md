# Wallet Adapter for Solana Wallets

Support for [Mobile Wallet Adapter](https://github.com/solana-mobile/mobile-wallet-adapter) (MWA) and the [Wallet Standard](https://github.com/wallet-standard/wallet-standard) has been added directly into Wallet Adapter.  Please review the MWA docs and [this guide for wallets](https://github.com/solana-labs/wallet-standard/blob/master/WALLET.md) to implement the Wallet Standard.

You can implement these protocols directly in your wallet, and your wallet will work across Solana apps. As wallets continue to add support for these protocols, the adapters for these wallets will be deprecated.

For any wallet injected into the window in a browser, browser extension, or mobile app, you no longer need to publish an adapter at all. You don't need to open a PR to MWA or the Wallet Standard.

We are no longer accepting contributions for new adapters of this type. Bug fixes to existing adapters are welcome, but new features should be implemented using the MWA and Wallet Standard interfaces.

Contributions are still welcome for new adapters that are not injected into the window but instead rely on loading an SDK to interact with an external wallet.


