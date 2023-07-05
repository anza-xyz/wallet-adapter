---
"@solana/wallet-adapter-react": patch
"@solana/wallet-adapter-ant-design": patch
"@solana/wallet-adapter-material-ui": patch
"@solana/wallet-adapter-react-ui": patch
---

feat: extract wallet buttons and text labels into separate components
Now that the wallet connection state is an enum, it makes it easier to extract the labels from the components. You can now bring your own i18n framework to bear on the `Base*` version of `WalletConnectButton`, `WalletDisconnectButton`, and `WalletMultiButton` to inject your own translated labels.
