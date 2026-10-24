---
'@solana/wallet-adapter-base': patch
---

Return `false` from `isIosAndRedirectable` when `navigator` is unavailable during server-side rendering.
