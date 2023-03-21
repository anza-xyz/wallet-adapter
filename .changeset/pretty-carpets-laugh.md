---
"@solana/wallet-adapter-react": patch
---

Update to 2.0.0 of the Solana Mobile Wallet adapter. This fixes a bug where the app's `AppIdentity` would not be forwarded to the wallet when `reauthorize` was called, as demanded by the specification.
