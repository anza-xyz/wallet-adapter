### Individual wallet app support packages (deprecated)

For any wallet injected into the window in a browser, browser extension, or mobile app, you no longer need to publish an adapter at all. You don't need to open a PR to MWA or the Wallet Standard.

We are no longer accepting contributions for new adapters of this type. Bug fixes to existing adapters are welcome, but new features should be implemented using the MWA and Wallet Standard interfaces.

Contributions are still welcome for new adapters that are not injected into the window but instead rely on loading an SDK to interact with an external wallet.

> **Warning**
> These packages were used to provide adapters for each wallet before Wallet Standard support. Per [WALLET.md these are no longer needed and should not be used](WALLET.md). The current version of wallet adapter will detect any registered Solana wallet. 

You can use the [wallets](packages/wallets/wallets) package, or add the individual wallet packages you want.

 - [wallets](packages/wallets/wallets)
Includes all the wallets (with tree shaking) [📦`@solana/wallet-adapter-wallets`](https://npmjs.com/package/@solana/wallet-adapter-wallets)

 - [alpha](packages/wallets/alpha)
Adapter for [Alpha](https://github.com/alphabatem/alpha-wallet) [📦`@solana/wallet-adapter-alpha`](https://npmjs.com/package/@solana/wallet-adapter-alpha)

 - [avana](packages/wallets/avana)
Adapter for [Avana](https://www.avanawallet.com) [📦`@solana/wallet-adapter-avana`](https://npmjs.com/package/@solana/wallet-adapter-avana)

 - [backpack](packages/wallets/backpack)
Adapter for [Backpack](https://backpack.app) [📦`@solana/wallet-adapter-backpack`](https://npmjs.com/package/@solana/wallet-adapter-backpack)

 - [bitkeep](packages/wallets/bitkeep)
Adapter for [BitKeep](https://bitkeep.com) [📦`@solana/wallet-adapter-bitkeep`](https://npmjs.com/package/@solana/wallet-adapter-bitkeep)

 - [bitpie](packages/wallets/bitpie)
Adapter for [Bitpie](https://bitpie.com) [📦`@solana/wallet-adapter-bitpie`](https://npmjs.com/package/@solana/wallet-adapter-bitpie)

 - [blocto](packages/wallets/blocto)
Adapter for [Blocto](https://blocto.app) [📦`@solana/wallet-adapter-blocto`](https://npmjs.com/package/@solana/wallet-adapter-blocto)

 - [brave](packages/wallets/brave)
Adapter for [Brave](https://brave.com/wallet) [📦`@solana/wallet-adapter-brave`](https://npmjs.com/package/@solana/wallet-adapter-brave)

 - [clv](packages/wallets/clover)
Adapter for [CLV](https://clv.org) [📦`@solana/wallet-adapter-clover`](https://npmjs.com/package/@solana/wallet-adapter-clover)

 - [coin98](packages/wallets/coin98)
Adapter for [Coin98](https://coin98.com) [📦`@solana/wallet-adapter-coin98`](https://npmjs.com/package/@solana/wallet-adapter-coin98)

 - [coinbase](packages/wallets/coinbase)
Adapter for [Coinbase](https://www.coinbase.com) [📦`@solana/wallet-adapter-coinbase`](https://npmjs.com/package/@solana/wallet-adapter-coinbase)

 - [coinhub](packages/wallets/coinhub)
Adapter for [Coinhub](https://coinhub.org) [📦`@solana/wallet-adapter-coinhub`](https://npmjs.com/package/@solana/wallet-adapter-coinhub)

 - [exodus](packages/wallets/exodus)
Adapter for [Exodus](https://exodus.com) [📦`@solana/wallet-adapter-exodus`](https://npmjs.com/package/@solana/wallet-adapter-exodus)

 - [fractal](packages/wallets/fractal)
Adapter for [Fractal](https://fractal.is) [📦`@solana/wallet-adapter-fractal`](https://npmjs.com/package/@solana/wallet-adapter-fractal)

 - [glow](packages/wallets/glow)
Adapter for [Glow](https://glow.app) [📦`@solana/wallet-adapter-glow`](https://npmjs.com/package/@solana/wallet-adapter-glow)

 - [huobi](packages/wallets/huobi)
Adapter for [HuobiWallet](https://www.huobiwallet.io) [📦`@solana/wallet-adapter-huobi`](https://npmjs.com/package/@solana/wallet-adapter-huobi)

 - [hyperpay](packages/wallets/hyperpay)
Adapter for [HyperPay](https://hyperpay.io) [📦`@solana/wallet-adapter-hyperpay`](https://npmjs.com/package/@solana/wallet-adapter-hyperpay)

 - [keystone](packages/wallets/keystone)
Adapter for [keystone](https://keyst.one) [📦`@solana/wallet-adapter-keystone`](https://npmjs.com/package/@solana/wallet-adapter-keystone)

 - [krystal](packages/wallets/krystal)
Adapter for [krystal](https://krystal.app) [📦`@solana/wallet-adapter-krystal`](https://npmjs.com/package/@solana/wallet-adapter-krystal)

 - [ledger](packages/wallets/ledger)
Adapter for [Ledger](https://ledger.com) [📦`@solana/wallet-adapter-ledger`](https://npmjs.com/package/@solana/wallet-adapter-ledger)

 - [mathwallet](packages/wallets/mathwallet)
Adapter for [MathWallet](https://mathwallet.org) [📦`@solana/wallet-adapter-mathwallet`](https://npmjs.com/package/@solana/wallet-adapter-mathwallet)

 - [neko](packages/wallets/neko)
Adapter for [Neko](https://nekowallet.com) [📦`@solana/wallet-adapter-neko`](https://npmjs.com/package/@solana/wallet-adapter-neko)

 - [nightly](packages/wallets/nightly)
Adapter for [Nightly](https://nightly.app) [📦`@solana/wallet-adapter-nightly`](https://npmjs.com/package/@solana/wallet-adapter-nightly)

 - [nufi](packages/wallets/nufi)
Adapter for [NuFi](https://nu.fi) [📦`@solana/wallet-adapter-nufi`](https://npmjs.com/package/@solana/wallet-adapter-nufi)

 - [onto](packages/wallets/onto)
Adapter for [ONTO](https://onto.app) [📦`@solana/wallet-adapter-onto`](https://npmjs.com/package/@solana/wallet-adapter-onto)

 - [particle](packages/wallets/particle)
Adapter for [Particle](https://particle.network) [📦`@solana/wallet-adapter-particle`](https://npmjs.com/package/@solana/wallet-adapter-particle)

 - [phantom](packages/wallets/phantom)
Adapter for [Phantom](https://phantom.app) [📦`@solana/wallet-adapter-phantom`](https://npmjs.com/package/@solana/wallet-adapter-phantom)

 - [safepal](packages/wallets/safepal)
Adapter for [SafePal](https://safepal.io) [📦`@solana/wallet-adapter-safepal`](https://npmjs.com/package/@solana/wallet-adapter-safepal)

 - [saifu](packages/wallets/saifu)
Adapter for [Saifu](https://saifuwallet.com) [📦`@solana/wallet-adapter-saifu`](https://npmjs.com/package/@solana/wallet-adapter-safepal)

 - [salmon](packages/wallets/salmon)
Adapter for [Salmon](https://www.salmonwallet.io) [📦`@solana/wallet-adapter-salmon`](https://npmjs.com/package/@solana/wallet-adapter-salmon)

 - [sky](packages/wallets/sky)
Adapter for [Sky](https://getsky.app) [📦`@solana/wallet-adapter-sky`](https://npmjs.com/package/@solana/wallet-adapter-sky)

 - [slope](packages/wallets/slope)
Adapter for [Slope](https://slope.finance) [📦`@solana/wallet-adapter-slope`](https://npmjs.com/package/@solana/wallet-adapter-slope)

 - [solflare](packages/wallets/solflare)
Adapter for [Solflare](https://solflare.com) [📦`@solana/wallet-adapter-solflare`](https://npmjs.com/package/@solana/wallet-adapter-solflare)

 - [sollet](packages/wallets/sollet)
Adapter for [Sollet](https://www.sollet.io) [📦`@solana/wallet-adapter-sollet`](https://npmjs.com/package/@solana/wallet-adapter-sollet)

 - [solong](packages/wallets/solong)
Adapter for [Solong](https://solongwallet.io) [📦`@solana/wallet-adapter-solong`](https://npmjs.com/package/@solana/wallet-adapter-solong)

 - [spot](packages/wallets/spot)
Adapter for [Spot](https://spot-wallet.com) [📦`@solana/wallet-adapter-spot`](https://npmjs.com/package/@solana/wallet-adapter-spot)

 - [strike](packages/wallets/strike)
Adapter for [Strike](https://strikeprotocols.com) [📦`@solana/wallet-adapter-strike`](https://npmjs.com/package/@solana/wallet-adapter-strike)

 - [tokenary](packages/wallets/tokenary)
Adapter for [Tokenary](https://tokenary.io) [📦`@solana/wallet-adapter-tokenary`](https://npmjs.com/package/@solana/wallet-adapter-tokenary)

 - [tokenpocket](packages/wallets/tokenpocket)
Adapter for [TokenPocket](https://tokenpocket.pro) [📦`@solana/wallet-adapter-tokenpocket`](https://npmjs.com/package/@solana/wallet-adapter-tokenpocket)

 - [torus](packages/wallets/torus)
Adapter for [Torus](https://tor.us) [📦`@solana/wallet-adapter-torus`](https://npmjs.com/package/@solana/wallet-adapter-torus)

 - [trust](packages/wallets/trust)
Adapter for [Trust Wallet](https://trustwallet.com) [📦`@solana/wallet-adapter-trust`](https://npmjs.com/package/@solana/wallet-adapter-trust)

 - [walletconnect](packages/wallets/walletconnect)
Adapter for [WalletConnect](https://walletconnect.com) [📦`@solana/wallet-adapter-walletconnect`](https://npmjs.com/package/@solana/wallet-adapter-walletconnect)
 - [xdefi](packages/wallets/xdefi)
Adapter for [XDEFI](https://xdefi.io) [📦`@solana/wallet-adapter-xdefi`](https://npmjs.com/package/@solana/wallet-adapter-xdefi)
