# @solana/wallet-adapter-react

## 0.15.35

### Patch Changes

-   bdc0eff: Remove deprecated wallet adapters that implement the Wallet Standard or are no longer functioning

## 0.15.34

### Patch Changes

-   a3d35a1: Add `signIn` (Sign In With Solana) method
-   Updated dependencies [a3d35a1]
    -   @solana/wallet-adapter-base@0.9.23

## 0.15.33

### Patch Changes

-   7b06737: Use wallet button hooks from base-ui package
-   ba57f75: feat: extract wallet buttons and text labels into separate components
    Now that the wallet connection state is an enum, it makes it easier to extract the labels from the components. You can now bring your own i18n framework to bear on the `Base*` version of `WalletConnectButton`, `WalletDisconnectButton`, and `WalletMultiButton` to inject your own translated labels.
-   7c6f2e1: feat: hooks that you can use to create custom wallet connection UI components
    Hooks that track the state of the wallet connection specifically for the purpose of rendering wallet connection UI. This will allow UI developers to create custom controls easily, using their own UI frameworks, localization infrastructure, and styles.

## 0.15.32

### Patch Changes

-   f62ce364: Update to 2.0.0 of the Solana Mobile Wallet adapter. This fixes a bug where the app's `AppIdentity` would not be forwarded to the wallet when `reauthorize` was called, as demanded by the specification.

## 0.15.31

### Patch Changes

-   61d62efa: Add VersionedTransaction support to AnchorWallet interface and useAnchorWallet hook

## 0.15.30

### Patch Changes

-   8a8fdc72: Update dependencies
-   Updated dependencies [8a8fdc72]
    -   @solana/wallet-adapter-base@0.9.22

## 0.15.29

### Patch Changes

-   Updated dependencies [f99c2154]
    -   @solana/wallet-adapter-base@0.9.21

## 0.15.28

### Patch Changes

-   0a5f56e: Wallet adapter no longer accidentally disconnects upon refreshing the page when in React Strict Mode.

## 0.15.27

### Patch Changes

-   faf61e6: Only call autoConnect if the connect is not a user selection

## 0.15.26

### Patch Changes

-   912cc0e: Allow wallets to customize autoConnect handling, adding support for Phantom deep links on iOS
-   Updated dependencies [912cc0e]
    -   @solana/wallet-adapter-base@0.9.20

## 0.15.25

### Patch Changes

-   Updated dependencies [353f2a5]
    -   @solana/wallet-adapter-base@0.9.19

## 0.15.24

### Patch Changes

-   21200bc: Optimize `WalletProvider.onError`

## 0.15.23

### Patch Changes

-   0e62d22: Fix for WalletProvider state being reset when `onError` function changes #637

## 0.15.22

### Patch Changes

-   5d016a2: Mobile Wallet Adapter and Wallet Standard support in `@solana/wallet-adapter-react`

    -   Early Access + Upgrade Guide: https://github.com/solana-labs/wallet-adapter/issues/604
    -   Changes in this release: https://github.com/solana-labs/wallet-adapter/pull/598
