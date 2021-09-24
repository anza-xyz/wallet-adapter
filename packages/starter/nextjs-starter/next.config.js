/* eslint-disable @typescript-eslint/no-var-requires */
const withTM = require('next-transpile-modules')([
    '@blocto/sdk',
    '@project-serum/sol-wallet-adapter',
    '@solana/wallet-adapter-angular',
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-wallets',
    '@solana/wallet-adapter-ant-design',
    '@solana/wallet-adapter-material-ui',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-bitpie',
    '@solana/wallet-adapter-blocto',
    '@solana/wallet-adapter-clover',
    '@solana/wallet-adapter-coin98',
    '@solana/wallet-adapter-ledger',
    '@solana/wallet-adapter-mathwallet',
    '@solana/wallet-adapter-phantom',
    '@solana/wallet-adapter-safepal',
    '@solana/wallet-adapter-slope',
    '@solana/wallet-adapter-solflare',
    '@solana/wallet-adapter-sollet',
    '@solana/wallet-adapter-solong',
    '@solana/wallet-adapter-torus',
    '@solana/wallet-adapter-walletconnect',
]);

/** @type {import('next').NextConfig} */
module.exports = withTM({
    reactStrictMode: true,
    webpack5: true,
});
