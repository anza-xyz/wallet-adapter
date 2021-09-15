import { MessageSignerWalletAdapter, SignerWalletAdapter, WalletAdapter } from '@solana/wallet-adapter-base';

export enum WalletName {
    Bitpie = 'Bitpie',
    Blocto = 'Blocto',
    // Clover = 'Clover',
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
    // WalletConnect = 'WalletConnect',
}

export interface Wallet {
    name: WalletName;
    url: string;
    icon: string;
    adapter: () => WalletAdapter | SignerWalletAdapter | MessageSignerWalletAdapter;
}
