# `@solana/wallet-adapter-glow`

[Glow](https://glow.app) is an easy-to-use, secure wallet for iOS.

## Platforms

We support the following platforms:

- **Desktop** Browser extension that works across Chrome, Brave, Edge, and Firefox
- **iOS** Safari extension that you can use in your native Safari browser
- **Android** in-app browser (coming August 2022)

## Resources

- [Download Glow](https://glow.app/download)
- [Demo of Glow + Wallet Adapter](https://wallet-adapter-example.luma-dev.com)
- [User Guide for Enabling Safari Extension](https://glow.app/safari)

## Setting Network

On Glow, the app is responsible for choosing the network that processes the transaction. We simulate all transactions
before prompting the user to approve them and if the app doesn't choose the right network, the simulation will fail.

```ts
// This will default to Mainnet
const wallets = useMemo(() => [new GlowWalletAdapter()])

// This will use Devnet
const devnetWallets = useMemo(() => [new GlowWalletAdapter({ network: "devnet" })])
```
