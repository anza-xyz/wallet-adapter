# `@solana/wallet-adapter-ant-design`

# Quick Setup (using Create-React-App with craco-less)
See the [example](https://github.com/solana-labs/wallet-adapter/tree/master/packages/example) package for more usage.

## Install

1. Set up craco if you haven't already using the following [guide]([https://link](https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#installation)).
2. Add `craco-less` into the project `yarn add craco-less`.
   1. Add it to the `craco.config.js` file
        ```javascript
        const CracoLessPlugin = require('craco-less');
        module.exports = {
            plugins: [
                {
                    plugin: CracoLessPlugin,
                    options: {
                        lessLoaderOptions: {
                            lessOptions: {
                                modifyVars: { '@primary-color': '#512da8' },
                                javascriptEnabled: true,
                            },
                        },
                    },
                },
            ],
        };
        ```
3. Install these peer dependencies (or skip this if you have them already):

```
yarn add antd \
         @ant-design/icons \
         @solana/web3.js \
         react
```
4. Install these dependencies:

```
yarn add @solana/wallet-adapter-wallets \
         @solana/wallet-adapter-react \
         @solana/wallet-adapter-ant-design \
         @solana/wallet-adapter-base
```


## Usage
Check out usage in the [example](https://github.com/solana-labs/wallet-adapter/tree/master/packages/example) package.

## Overrides

You can override the following elements from the stylesheet:

```
.wallet-adapter-icon
.wallet-adapter-modal-menu
.wallet-adapter-modal-menu-item
.wallet-adapter-modal-menu-button
.wallet-adapter-modal-menu-button-icon
.wallet-adapter-multi-button-menu
.wallet-adapter-multi-button-menu-item
.wallet-adapter-multi-button-menu-button
.wallet-adapter-multi-button-icon
.wallet-adapter-multi-button-item
```