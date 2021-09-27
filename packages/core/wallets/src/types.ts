import { MessageSignerWalletAdapter, SignerWalletAdapter, WalletAdapter } from '@solana/wallet-adapter-base';

export enum WalletName {
    // Bitpie = 'Bitpie', // not published yet
    Blocto = 'Blocto',
    // Clover = 'Clover', // not published yet
    Coin98 = 'Coin98',
    Ledger = 'Ledger',
    MathWallet = 'MathWallet',
    Phantom = 'Phantom',
    SafePal = 'SafePal',
    Slope = 'Slope',
    Solflare = 'Solflare',
    SolflareWeb = 'Solflare (Web)',
    Sollet = 'Sollet',
    SolletExtension = 'Sollet (Extension)',
    Solong = 'Solong',
    Torus = 'Torus',
    // WalletConnect = 'WalletConnect', // not published yet
}

export interface Wallet {
    name: WalletName;
    url: string;
    icon: string;
    adapter: () => WalletAdapter | SignerWalletAdapter | MessageSignerWalletAdapter;
}
