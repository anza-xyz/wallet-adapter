# Solana Wallet Adapter

The Solana Wallet Adapter allows Solana dApps to talk to a user's registered wallet apps. 

See the [live demo](https://solana-labs.github.io/wallet-adapter/example/) and [demo code](./packages/starter/example/).

![Wallets](wallets.png)
## For Solana dApp developers

This library is organized into small packages with few dependencies.

To add wallet-adapter support to your dApp, you'll need core packages and UI components for your chosen framework.

### Core

These packages are what most projects can use to support wallets on Solana.

 - [base](packages/core/base)
Adapter interfaces, error types, and common utilities [📦`@solana/wallet-adapter-base`](https://npmjs.com/package/@solana/wallet-adapter-base)

 - [react](packages/core/react)
Contexts and hooks for React apps [📦`@solana/wallet-adapter-react`](https://npmjs.com/package/@solana/wallet-adapter-react)

### Community

Several core packages are maintained by the community to support additional frontend frameworks.

> **Warning**
> Some of these packages may need updates to support Solana Wallet Standard.

- [Vue](https://github.com/lorisleiva/solana-wallets-vue)
- [Angular](https://github.com/heavy-duty/platform/tree/master/libs/wallet-adapter)
- [Svelte](https://github.com/svelte-on-solana/wallet-adapter)

### UI Components

These packages provide components for common UI frameworks.

 - [react-ui](packages/ui/react-ui)
Components for React (no UI framework, just CSS). [📦`@solana/wallet-adapter-react-ui`](https://npmjs.com/package/@solana/wallet-adapter-react-ui)

 - [material-ui](packages/ui/material-ui)
Components for [Material UI](https://material-ui.com) with React. [📦`@solana/wallet-adapter-material-ui`](https://npmjs.com/package/@solana/wallet-adapter-material-ui)

 - [ant-design](packages/ui/ant-design)
Components for [Ant Design](https://ant.design) with React. [📦`@solana/wallet-adapter-ant-design`](https://npmjs.com/package/@solana/wallet-adapter-ant-design)

 - [angular-material-ui](https://github.com/heavy-duty/platform/tree/master/libs/wallet-adapter/ui/material)
Components for [Angular Material UI](https://material.angular.io/) [📦`@heavy-duty/wallet-adapter-material`](https://www.npmjs.com/package/@heavy-duty/wallet-adapter-material)

### Starter Projects

> **Warning**
> Some of these packages may need updates to support Solana Wallet Standard.

These packages provide projects that you can use to start building a app with built-in wallet support.

 - [example](packages/starter/example)
Demo of UI components and wallets [📦`@solana/wallet-adapter-example`](https://npmjs.com/package/@solana/wallet-adapter-example)

 - [create-react-app-starter](packages/starter/create-react-app-starter) - [Create React App](https://create-react-app.dev) project using React UI [📦`@solana/wallet-adapter-create-react-app-starter`](https://npmjs.com/package/@solana/wallet-adapter-create-react-app-starter)

 - [material-ui-starter](packages/starter/material-ui-starter) - [Parcel](https://parceljs.org) project using Material UI [📦`@solana/wallet-adapter-material-ui-starter`](https://npmjs.com/package/@solana/wallet-adapter-material-ui-starter)

 - [react-ui-starter](packages/starter/react-ui-starter) - [Parcel](https://parceljs.org) project using React UI [📦`@solana/wallet-adapter-react-ui-starter`](https://npmjs.com/package/@solana/wallet-adapter-react-ui-starter)

 - [nextjs-starter](packages/starter/nextjs-starter) - [Next.js](https://nextjs.org) project using React UI [📦`@solana/wallet-adapter-nextjs-starter`](https://npmjs.com/package/@solana/wallet-adapter-nextjs-starter)

Alternatively, check out [solana-dapp-scaffold](https://github.com/solana-labs/dapp-scaffold) for a more complete framework.

## For Solana Wallet App Developers

Support for [Mobile Wallet Adapter](https://github.com/solana-mobile/mobile-wallet-adapter) (MWA) and the [Wallet Standard](https://github.com/wallet-standard/wallet-standard) has been added directly into Wallet Adapter.  Please review the Mobile Wallet Adapter docs and [this guide for wallets](https://github.com/solana-labs/wallet-standard/blob/master/WALLET.md) to implement the Wallet Standard.

You can implement Wallet Adapter in your wallet app, and, thanks to Wallet Standard, your wallet app will work across all Solana dApps. 

Prior to Wallet Standard, each wallet app had individual wallet adapter packages. **Adapters for individual wallets are now deprecated.** See [DEPRECATED](./DEPRECATED.md).

## Other docs

- [TypeScript Docs](https://solana-labs.github.io/wallet-adapter/)
- [FAQ (Frequently Asked Questions)](FAQ.md)
- [Build Wallet Adapter from Source](BUILD.md)

