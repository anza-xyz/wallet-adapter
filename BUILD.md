# Build Wallet Adapter from Source

### 0. Prerequisites

* Node 16+
* PNPM

If you have Node 16+, you can [activate PNPM with Corepack](https://pnpm.io/installation#using-corepack):
```shell
corepack enable
corepack prepare pnpm@`npm info pnpm --json | jq -r .version` --activate
```

Corepack requires a version to enable, so if you don't have [jq](https://stedolan.github.io/jq/) installed, you can [install it](https://formulae.brew.sh/formula/jq), or just manually get the current version of pnpm with `npm info pnpm` and use it like this:
```shell
corepack prepare pnpm@8.1.0 --activate
```

### 1. Clone the project:
```shell
git clone https://github.com/solana-labs/wallet-adapter.git
```

### 2. Install dependencies:
```shell
cd wallet-adapter
pnpm install
```

### 3. Build all packages:
```shell
pnpm run build
```
Please be patient! This may take a while the first time you do it. Subsequent builds will be incremental and are quite fast.

You can also use `pnpm watch` to run incremental builds when source files change, enabling hot module reloading.

### 4. Run locally:
```shell
cd packages/starter/react-ui-starter
pnpm run start
open http://localhost:1234
```
