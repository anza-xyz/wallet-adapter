# Wallet Adapter Packages

This repository is organized into small packages with few dependencies.

To add support for Solana Wallets to your app, you'll need core packages, some wallets, and UI components for your chosen framework.

### Core

These packages are what most projects can use to support wallets on Solana.


[base](./packages/core/base) Adapter interfaces, error types, and common utilities [📦 NPM  `@solana/wallet-adapter-base`](https://npmjs.com/package/@solana/wallet-adapter-base) 

[react](./packages/core/react) Contexts and hooks for React apps [📦 NPM  `@solana/wallet-adapter-react`](https://npmjs.com/package/@solana/wallet-adapter-react) 

### Community

Several core packages are maintained by the community to support additional frontend frameworks.

- [Vue](https://github.com/lorisleiva/solana-wallets-vue)
- [Angular](https://github.com/heavy-duty/platform/tree/master/libs/wallet-adapter)
- [Svelte](https://github.com/svelte-on-solana/wallet-adapter)
- [TypeScript](https://github.com/ronanyeah/solana-connect)

### UI Components

These packages provide components for common UI frameworks.


[react-ui](./packages/ui/react-ui) Components for React (no UI framework, just CSS) [📦 NPM  `@solana/wallet-adapter-react-ui`](https://npmjs.com/package/@solana/wallet-adapter-react-ui) 

[material-ui](./packages/ui/material-ui) Components for [Material UI](https://material-ui.com) with React [📦 NPM  `@solana/wallet-adapter-material-ui`](https://npmjs.com/package/@solana/wallet-adapter-material-ui) 

[ant-design](./packages/ui/ant-design) Components for [Ant Design](https://ant.design) with React [📦 NPM  `@solana/wallet-adapter-ant-design`](https://npmjs.com/package/@solana/wallet-adapter-ant-design) 

[angular-material-ui](https://github.com/heavy-duty/platform/tree/master/libs/wallet-adapter/ui/material) Components for [Angular Material UI](https://material.angular.io/) [📦 NPM  `@heavy-duty/wallet-adapter-material`](https://www.npmjs.com/package/@heavy-duty/wallet-adapter-material) 

### Starter Projects

These packages provide projects that you can use to start building a app with built-in wallet support.
Alternatively, check out [solana-dapp-next](https://github.com/lisenmayben/solana-dapp-next) for a more complete framework.


[example](./packages/starter/example) Demo of UI components and wallets [📦 NPM  `@solana/wallet-adapter-example`](https://npmjs.com/package/@solana/wallet-adapter-example) 

[create-react-app-starter](./packages/starter/create-react-app-starter) [Create React App](https://create-react-app.dev) project using React UI [📦 NPM  `@solana/wallet-adapter-create-react-app-starter`](https://npmjs.com/package/@solana/wallet-adapter-create-react-app-starter) 

[material-ui-starter](./packages/starter/material-ui-starter) [Parcel](https://parceljs.org) project using Material UI [📦 NPM  `@solana/wallet-adapter-material-ui-starter`](https://npmjs.com/package/@solana/wallet-adapter-material-ui-starter) 

[react-ui-starter](./packages/starter/react-ui-starter) [Parcel](https://parceljs.org) project using React UI [📦 NPM  `@solana/wallet-adapter-react-ui-starter`](https://npmjs.com/package/@solana/wallet-adapter-react-ui-starter) 

[nextjs-starter](./packages/starter/nextjs-starter) [Next.js](https://nextjs.org) project using React UI [📦 NPM  `@solana/wallet-adapter-nextjs-starter`](https://npmjs.com/package/@solana/wallet-adapter-nextjs-starter) 

### Wallet -App-Specific Wallet Adapters

These packages provide adapters for specific wallets.

You can use the [wallets](./packages/wallets/wallets) package, or add the individual wallet packages you want.

Note support for all wallets that support Wallet Standard is included out of the box.


[wallets](./packages/wallets/wallets) Includes all the wallets (with tree shaking) [📦 NPM  `@solana/wallet-adapter-wallets`](https://npmjs.com/package/@solana/wallet-adapter-wallets) 

[alpha](./packages/wallets/alpha) Adapter for [Alpha](https://github.com/alphabatem/alpha-wallet) [📦 NPM  `@solana/wallet-adapter-alpha`](https://npmjs.com/package/@solana/wallet-adapter-alpha) 

[avana](./packages/wallets/avana) Adapter for [Avana](https://www.avanawallet.com) [📦 NPM  `@solana/wallet-adapter-avana`](https://npmjs.com/package/@solana/wallet-adapter-avana) 

[backpack](./packages/wallets/backpack) Adapter for [Backpack](https://backpack.app) [📦 NPM  `@solana/wallet-adapter-backpack`](https://npmjs.com/package/@solana/wallet-adapter-backpack) 

[bitkeep](./packages/wallets/bitkeep) Adapter for [BitKeep](https://bitkeep.com) [📦 NPM  `@solana/wallet-adapter-bitkeep`](https://npmjs.com/package/@solana/wallet-adapter-bitkeep) 

[bitpie](./packages/wallets/bitpie) Adapter for [Bitpie](https://bitpie.com) [📦 NPM  `@solana/wallet-adapter-bitpie`](https://npmjs.com/package/@solana/wallet-adapter-bitpie) 

[blocto](./packages/wallets/blocto) Adapter for [Blocto](https://blocto.app) [📦 NPM  `@solana/wallet-adapter-blocto`](https://npmjs.com/package/@solana/wallet-adapter-blocto) 

[brave](./packages/wallets/brave) Adapter for [Brave](https://brave.com/wallet) [📦 NPM  `@solana/wallet-adapter-brave`](https://npmjs.com/package/@solana/wallet-adapter-brave) 

[clv](./packages/wallets/clover) Adapter for [CLV](https://clv.org) [📦 NPM  `@solana/wallet-adapter-clover`](https://npmjs.com/package/@solana/wallet-adapter-clover) 

[coin98](./packages/wallets/coin98) Adapter for [Coin98](https://coin98.com) [📦 NPM  `@solana/wallet-adapter-coin98`](https://npmjs.com/package/@solana/wallet-adapter-coin98) 

[coinbase](./packages/wallets/coinbase) Adapter for [Coinbase](https://www.coinbase.com) [📦 NPM  `@solana/wallet-adapter-coinbase`](https://npmjs.com/package/@solana/wallet-adapter-coinbase) 

[coinhub](./packages/wallets/coinhub) Adapter for [Coinhub](https://coinhub.org) [📦 NPM  `@solana/wallet-adapter-coinhub`](https://npmjs.com/package/@solana/wallet-adapter-coinhub) 

[exodus](./packages/wallets/exodus) Adapter for [Exodus](https://exodus.com) [📦 NPM  `@solana/wallet-adapter-exodus`](https://npmjs.com/package/@solana/wallet-adapter-exodus) 

[fractal](./packages/wallets/fractal) Adapter for [Fractal](https://fractal.is) [📦 NPM  `@solana/wallet-adapter-fractal`](https://npmjs.com/package/@solana/wallet-adapter-fractal) 

[glow](./packages/wallets/glow) Adapter for [Glow](https://glow.app) [📦 NPM  `@solana/wallet-adapter-glow`](https://npmjs.com/package/@solana/wallet-adapter-glow) 

[huobi](./packages/wallets/huobi) Adapter for [HuobiWallet](https://www.huobiwallet.io) [📦 NPM  `@solana/wallet-adapter-huobi`](https://npmjs.com/package/@solana/wallet-adapter-huobi) 

[hyperpay](./packages/wallets/hyperpay) Adapter for [HyperPay](https://hyperpay.io) [📦 NPM  `@solana/wallet-adapter-hyperpay`](https://npmjs.com/package/@solana/wallet-adapter-hyperpay) 

[keystone](./packages/wallets/keystone) Adapter for [keystone](https://keyst.one) [📦 NPM  `@solana/wallet-adapter-keystone`](https://npmjs.com/package/@solana/wallet-adapter-keystone) 

[krystal](./packages/wallets/krystal) Adapter for [krystal](https://krystal.app) [📦 NPM  `@solana/wallet-adapter-krystal`](https://npmjs.com/package/@solana/wallet-adapter-krystal) 

[ledger](./packages/wallets/ledger) Adapter for [Ledger](https://ledger.com) [📦 NPM  `@solana/wallet-adapter-ledger`](https://npmjs.com/package/@solana/wallet-adapter-ledger) 

[mathwallet](./packages/wallets/mathwallet) Adapter for [MathWallet](https://mathwallet.org) [📦 NPM  `@solana/wallet-adapter-mathwallet`](https://npmjs.com/package/@solana/wallet-adapter-mathwallet) 

[neko](./packages/wallets/neko) Adapter for [Neko](https://nekowallet.com) [📦 NPM  `@solana/wallet-adapter-neko`](https://npmjs.com/package/@solana/wallet-adapter-neko) 

[nightly](./packages/wallets/nightly) Adapter for [Nightly](https://nightly.app) [📦 NPM  `@solana/wallet-adapter-nightly`](https://npmjs.com/package/@solana/wallet-adapter-nightly) 

[nufi](./packages/wallets/nufi) Adapter for [NuFi](https://nu.fi) [📦 NPM  `@solana/wallet-adapter-nufi`](https://npmjs.com/package/@solana/wallet-adapter-nufi) 

[onto](./packages/wallets/onto) Adapter for [ONTO](https://onto.app) [📦 NPM  `@solana/wallet-adapter-onto`](https://npmjs.com/package/@solana/wallet-adapter-onto) 

[particle](./packages/wallets/particle) Adapter for [Particle](https://particle.network) [📦 NPM  `@solana/wallet-adapter-particle`](https://npmjs.com/package/@solana/wallet-adapter-particle) 

[phantom](./packages/wallets/phantom) Adapter for [Phantom](https://phantom.app) [📦 NPM  `@solana/wallet-adapter-phantom`](https://npmjs.com/package/@solana/wallet-adapter-phantom) 

[safepal](./packages/wallets/safepal) Adapter for [SafePal](https://safepal.io) [📦 NPM  `@solana/wallet-adapter-safepal`](https://npmjs.com/package/@solana/wallet-adapter-safepal) 

[saifu](./packages/wallets/saifu) Adapter for [Saifu](https://saifuwallet.com) [📦 NPM  `@solana/wallet-adapter-saifu`](https://npmjs.com/package/@solana/wallet-adapter-safepal) 

[salmon](./packages/wallets/salmon) Adapter for [Salmon](https://www.salmonwallet.io) [📦 NPM  `@solana/wallet-adapter-salmon`](https://npmjs.com/package/@solana/wallet-adapter-salmon) 

[sky](./packages/wallets/sky) Adapter for [Sky](https://getsky.app) [📦 NPM  `@solana/wallet-adapter-sky`](https://npmjs.com/package/@solana/wallet-adapter-sky) 

[slope](./packages/wallets/slope) Adapter for [Slope](https://slope.finance) [📦 NPM  `@solana/wallet-adapter-slope`](https://npmjs.com/package/@solana/wallet-adapter-slope) 

[solflare](./packages/wallets/solflare) Adapter for [Solflare](https://solflare.com) [📦 NPM  `@solana/wallet-adapter-solflare`](https://npmjs.com/package/@solana/wallet-adapter-solflare) 

[sollet](./packages/wallets/sollet) Adapter for [Sollet](https://www.sollet.io) [📦 NPM  `@solana/wallet-adapter-sollet`](https://npmjs.com/package/@solana/wallet-adapter-sollet) 

[solong](./packages/wallets/solong) Adapter for [Solong](https://solongwallet.io) [📦 NPM  `@solana/wallet-adapter-solong`](https://npmjs.com/package/@solana/wallet-adapter-solong) 

[spot](./packages/wallets/spot) Adapter for [Spot](https://spot-wallet.com) [📦 NPM  `@solana/wallet-adapter-spot`](https://npmjs.com/package/@solana/wallet-adapter-spot) 

[strike](./packages/wallets/strike) Adapter for [Strike](https://strikeprotocols.com) [📦 NPM  `@solana/wallet-adapter-strike`](https://npmjs.com/package/@solana/wallet-adapter-strike) 

[tokenary](./packages/wallets/tokenary) Adapter for [Tokenary](https://tokenary.io) [📦 NPM  `@solana/wallet-adapter-tokenary`](https://npmjs.com/package/@solana/wallet-adapter-tokenary) 

[tokenpocket](./packages/wallets/tokenpocket) Adapter for [TokenPocket](https://tokenpocket.pro) [📦 NPM  `@solana/wallet-adapter-tokenpocket`](https://npmjs.com/package/@solana/wallet-adapter-tokenpocket) 

[torus](./packages/wallets/torus) Adapter for [Torus](https://tor.us) [📦 NPM  `@solana/wallet-adapter-torus`](https://npmjs.com/package/@solana/wallet-adapter-torus) 

[trust](./packages/wallets/trust) Adapter for [Trust Wallet](https://trustwallet.com) [📦 NPM  `@solana/wallet-adapter-trust`](https://npmjs.com/package/@solana/wallet-adapter-trust) 

[walletconnect](./packages/wallets/walletconnect) Adapter for [WalletConnect](https://walletconnect.com) [📦 NPM  `@solana/wallet-adapter-walletconnect`](https://npmjs.com/package/@solana/wallet-adapter-walletconnect) 

[xdefi](./packages/wallets/xdefi) Adapter for [XDEFI](https://xdefi.io) [📦 NPM  `@solana/wallet-adapter-xdefi`](https://npmjs.com/package/@solana/wallet-adapter-xdefi) 
