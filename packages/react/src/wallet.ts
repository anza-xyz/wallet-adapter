import { WalletAdapter } from '@solana/wallet-adapter-base';

export enum WalletName {
    Phantom = 'Phantom',
    Ledger = 'Ledger',
    Torus = 'Torus',
    Solong = 'Solong',
    // WalletConnect = 'WalletConnect',
    MathWallet = 'MathWallet',
    Sollet = 'Sollet',
}

export interface Wallet {
    name: WalletName;
    url: string;
    icon: string;
    adapter: () => WalletAdapter;
}
