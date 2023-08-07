# Wallet Adapter

The wallet adapter allows Solana apps (also called distributed apps or dApps) to work with installed Solana wallet apps (often called 'wallets').

![Wallets](wallets.png)

[Live Demo](https://solana-labs.github.io/wallet-adapter/example/)

Wallet apps may either:

 - Support the [Wallet Standard](https://github.com/wallet-standard/wallet-standard) - a newer, cross-chain standard that allows any installed wallet app to be discovered and used by Solana apps
 - Have an individual adapter to take advantage of particular unique features of the wallet app.

See [the packages needed to add Wallet Adapter to your app](./PACKAGES.md) and [instructions for building the packages in this repository](./BUILD.md)

- [For developers building Solana Apps](./APP.md)
- [For developers building Solana Wallet apps](./WALLET.md)
- [TypeScript Docs](https://solana-labs.github.io/wallet-adapter/)
- [FAQ (Frequently Asked Questions)](./FAQ.md)
