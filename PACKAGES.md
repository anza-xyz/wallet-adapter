# Wallet Adapter Packages

This library is organized into small packages with few dependencies.

To add it to your app, you'll need core packages, some wallets, and UI components for your chosen framework.

### Core
These packages are what most projects can use to support wallets on Solana.

| package                                                                                | description                                           | npm                                                                                      |
|----------------------------------------------------------------------------------------|-------------------------------------------------------|------------------------------------------------------------------------------------------|
| [base](https://github.com/solana-labs/wallet-adapter/tree/master/packages/core/base)   | Adapter interfaces, error types, and common utilities | [`@solana/wallet-adapter-base`](https://npmjs.com/package/@solana/wallet-adapter-base)   |
| [react](https://github.com/solana-labs/wallet-adapter/tree/master/packages/core/react) | Contexts and hooks for React apps                     | [`@solana/wallet-adapter-react`](https://npmjs.com/package/@solana/wallet-adapter-react) |

### Community
Several core packages are maintained by the community to support additional frontend frameworks.

- [Vue](https://github.com/lorisleiva/solana-wallets-vue)
- [Angular](https://github.com/heavy-duty/platform/tree/master/libs/wallet-adapter)
- [Svelte](https://github.com/svelte-on-solana/wallet-adapter)
- [TypeScript](https://github.com/ronanyeah/solana-connect)

### UI Components
These packages provide components for common UI frameworks.

| package                                                                                                   | description                                                        | npm                                                                                                        |
|-----------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| [react-ui](https://github.com/solana-labs/wallet-adapter/tree/master/packages/ui/react-ui)                | Components for React (no UI framework, just CSS)                   | [`@solana/wallet-adapter-react-ui`](https://npmjs.com/package/@solana/wallet-adapter-react-ui)             |
| [material-ui](https://github.com/solana-labs/wallet-adapter/tree/master/packages/ui/material-ui)          | Components for [Material UI](https://material-ui.com) with React   | [`@solana/wallet-adapter-material-ui`](https://npmjs.com/package/@solana/wallet-adapter-material-ui)       |
| [ant-design](https://github.com/solana-labs/wallet-adapter/tree/master/packages/ui/ant-design)            | Components for [Ant Design](https://ant.design) with React         | [`@solana/wallet-adapter-ant-design`](https://npmjs.com/package/@solana/wallet-adapter-ant-design)         |
| [angular-material-ui](https://github.com/heavy-duty/platform/tree/master/libs/wallet-adapter/ui/material) | Components for [Angular Material UI](https://material.angular.io/) | [`@heavy-duty/wallet-adapter-material`](https://www.npmjs.com/package/@heavy-duty/wallet-adapter-material) |

### Wallets
These packages provide adapters for each wallet.
You can use the [wallets](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/wallets) package, or add the individual wallet packages you want.

| package                                                                                                   | description                                                     | npm                                                                                                      |
|-----------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| [wallets](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/wallets)             | Includes all the wallets (with tree shaking)                    | [`@solana/wallet-adapter-wallets`](https://npmjs.com/package/@solana/wallet-adapter-wallets)             |
| [alpha](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/alpha)                 | Adapter for [Alpha](https://github.com/alphabatem/alpha-wallet) | [`@solana/wallet-adapter-alpha`](https://npmjs.com/package/@solana/wallet-adapter-alpha)                 |
| [avana](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/avana)                 | Adapter for [Avana](https://www.avanawallet.com)                | [`@solana/wallet-adapter-avana`](https://npmjs.com/package/@solana/wallet-adapter-avana)                 |
| [bitkeep](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/bitkeep)             | Adapter for [BitKeep](https://bitkeep.com)                      | [`@solana/wallet-adapter-bitkeep`](https://npmjs.com/package/@solana/wallet-adapter-bitkeep)             |
| [bitpie](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/bitpie)               | Adapter for [Bitpie](https://bitpie.com)                        | [`@solana/wallet-adapter-bitpie`](https://npmjs.com/package/@solana/wallet-adapter-bitpie)               |
| [clv](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/clover)                  | Adapter for [CLV](https://clv.org)                              | [`@solana/wallet-adapter-clover`](https://npmjs.com/package/@solana/wallet-adapter-clover)               |
| [coin98](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/coin98)               | Adapter for [Coin98](https://coin98.com)                        | [`@solana/wallet-adapter-coin98`](https://npmjs.com/package/@solana/wallet-adapter-coin98)               |
| [coinbase](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/coinbase)           | Adapter for [Coinbase](https://www.coinbase.com)                | [`@solana/wallet-adapter-coinbase`](https://npmjs.com/package/@solana/wallet-adapter-coinbase)           |
| [coinhub](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/coinhub)             | Adapter for [Coinhub](https://coinhub.org)                      | [`@solana/wallet-adapter-coinhub`](https://npmjs.com/package/@solana/wallet-adapter-coinhub)             |
| [fractal](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/fractal)             | Adapter for [Fractal](https://fractal.is)                       | [`@solana/wallet-adapter-fractal`](https://npmjs.com/package/@solana/wallet-adapter-fractal)             |
| [huobi](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/huobi)                 | Adapter for [HuobiWallet](https://www.huobiwallet.io)           | [`@solana/wallet-adapter-huobi`](https://npmjs.com/package/@solana/wallet-adapter-huobi)                 |
| [hyperpay](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/hyperpay)           | Adapter for [HyperPay](https://hyperpay.io)                     | [`@solana/wallet-adapter-hyperpay`](https://npmjs.com/package/@solana/wallet-adapter-hyperpay)           |
| [keystone](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/keystone)           | Adapter for [keystone](https://keyst.one)                       | [`@solana/wallet-adapter-keystone`](https://npmjs.com/package/@solana/wallet-adapter-keystone)           |
| [krystal](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/krystal)             | Adapter for [krystal](https://krystal.app)                      | [`@solana/wallet-adapter-krystal`](https://npmjs.com/package/@solana/wallet-adapter-krystal)             |
| [ledger](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/ledger)               | Adapter for [Ledger](https://ledger.com)                        | [`@solana/wallet-adapter-ledger`](https://npmjs.com/package/@solana/wallet-adapter-ledger)               |
| [mathwallet](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/mathwallet)       | Adapter for [MathWallet](https://mathwallet.org)                | [`@solana/wallet-adapter-mathwallet`](https://npmjs.com/package/@solana/wallet-adapter-mathwallet)       |
| [neko](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/neko)                   | Adapter for [Neko](https://nekowallet.com)                      | [`@solana/wallet-adapter-neko`](https://npmjs.com/package/@solana/wallet-adapter-neko)                   |
| [nightly](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/nightly)             | Adapter for [Nightly](https://nightly.app)                      | [`@solana/wallet-adapter-nightly`](https://npmjs.com/package/@solana/wallet-adapter-nightly)             |
| [nufi](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/nufi)                   | Adapter for [NuFi](https://nu.fi)                               | [`@solana/wallet-adapter-nufi`](https://npmjs.com/package/@solana/wallet-adapter-nufi)                   |
| [onto](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/onto)                   | Adapter for [ONTO](https://onto.app)                            | [`@solana/wallet-adapter-onto`](https://npmjs.com/package/@solana/wallet-adapter-onto)                   |
| [particle](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/particle)           | Adapter for [Particle](https://particle.network)                | [`@solana/wallet-adapter-particle`](https://npmjs.com/package/@solana/wallet-adapter-particle)           |
| [phantom](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/phantom)             | Adapter for [Phantom](https://phantom.app)                      | [`@solana/wallet-adapter-phantom`](https://npmjs.com/package/@solana/wallet-adapter-phantom)             |
| [safepal](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/safepal)             | Adapter for [SafePal](https://safepal.io)                       | [`@solana/wallet-adapter-safepal`](https://npmjs.com/package/@solana/wallet-adapter-safepal)             |
| [saifu](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/saifu)                 | Adapter for [Saifu](https://saifuwallet.com)                    | [`@solana/wallet-adapter-saifu`](https://npmjs.com/package/@solana/wallet-adapter-safepal)               |
| [salmon](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/salmon)               | Adapter for [Salmon](https://www.salmonwallet.io)               | [`@solana/wallet-adapter-salmon`](https://npmjs.com/package/@solana/wallet-adapter-salmon)               |
| [sky](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/sky)                     | Adapter for [Sky](https://getsky.app)                           | [`@solana/wallet-adapter-sky`](https://npmjs.com/package/@solana/wallet-adapter-sky)                     |
| [solflare](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/solflare)           | Adapter for [Solflare](https://solflare.com)                    | [`@solana/wallet-adapter-solflare`](https://npmjs.com/package/@solana/wallet-adapter-solflare)           |
| [solong](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/solong)               | Adapter for [Solong](https://solongwallet.io)                   | [`@solana/wallet-adapter-solong`](https://npmjs.com/package/@solana/wallet-adapter-solong)               |
| [spot](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/spot)                   | Adapter for [Spot](https://spot-wallet.com)                     | [`@solana/wallet-adapter-spot`](https://npmjs.com/package/@solana/wallet-adapter-spot)                   |
| [tokenary](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/tokenary)           | Adapter for [Tokenary](https://tokenary.io)                     | [`@solana/wallet-adapter-tokenary`](https://npmjs.com/package/@solana/wallet-adapter-tokenary)           |
| [tokenpocket](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/tokenpocket)     | Adapter for [TokenPocket](https://tokenpocket.pro)              | [`@solana/wallet-adapter-tokenpocket`](https://npmjs.com/package/@solana/wallet-adapter-tokenpocket)     |
| [torus](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/torus)                 | Adapter for [Torus](https://tor.us)                             | [`@solana/wallet-adapter-torus`](https://npmjs.com/package/@solana/wallet-adapter-torus)                 |
| [trust](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/trust)                 | Adapter for [Trust Wallet](https://trustwallet.com)             | [`@solana/wallet-adapter-trust`](https://npmjs.com/package/@solana/wallet-adapter-trust)                 |
| [walletconnect](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/walletconnect) | Adapter for [WalletConnect](https://walletconnect.com)          | [`@solana/wallet-adapter-walletconnect`](https://npmjs.com/package/@solana/wallet-adapter-walletconnect) |
| [xdefi](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/xdefi)                 | Adapter for [XDEFI](https://xdefi.io)                           | [`@solana/wallet-adapter-xdefi`](https://npmjs.com/package/@solana/wallet-adapter-xdefi)                 |

### Starter Projects
These packages provide projects that you can use to start building a app with built-in wallet support.
Alternatively, check out [solana-dapp-next](https://github.com/lisenmayben/solana-dapp-next) for a more complete framework.

| package                                                                                                                         | description                                                             | npm                                                                                                                            |
|---------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| [example](https://github.com/solana-labs/wallet-adapter/tree/master/packages/starter/example)                                   | Demo of UI components and wallets                                       | [`@solana/wallet-adapter-example`](https://npmjs.com/package/@solana/wallet-adapter-example)                                   |
| [create-react-app-starter](https://github.com/solana-labs/wallet-adapter/tree/master/packages/starter/create-react-app-starter) | [Create React App](https://create-react-app.dev) project using React UI | [`@solana/wallet-adapter-create-react-app-starter`](https://npmjs.com/package/@solana/wallet-adapter-create-react-app-starter) |
| [material-ui-starter](https://github.com/solana-labs/wallet-adapter/tree/master/packages/starter/material-ui-starter)           | [Parcel](https://parceljs.org) project using Material UI                | [`@solana/wallet-adapter-material-ui-starter`](https://npmjs.com/package/@solana/wallet-adapter-material-ui-starter)           |
| [react-ui-starter](https://github.com/solana-labs/wallet-adapter/tree/master/packages/starter/react-ui-starter)                 | [Parcel](https://parceljs.org) project using React UI                   | [`@solana/wallet-adapter-react-ui-starter`](https://npmjs.com/package/@solana/wallet-adapter-react-ui-starter)                 |
| [nextjs-starter](https://github.com/solana-labs/wallet-adapter/tree/master/packages/starter/nextjs-starter)                     | [Next.js](https://nextjs.org) project using React UI                    | [`@solana/wallet-adapter-nextjs-starter`](https://npmjs.com/package/@solana/wallet-adapter-nextjs-starter)                     |
