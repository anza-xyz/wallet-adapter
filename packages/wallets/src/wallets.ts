import { WalletAdapter } from '@solana/wallet-adapter-base';
import { LedgerWalletAdapter, LedgerWalletAdapterConfig } from '@solana/wallet-adapter-ledger';
import { MathWalletWalletAdapter, MathWalletWalletAdapterConfig } from '@solana/wallet-adapter-mathwallet';
import { PhantomWalletAdapter, PhantomWalletAdapterConfig } from '@solana/wallet-adapter-phantom';
import { SolletWalletAdapter, SolletWalletAdapterConfig } from '@solana/wallet-adapter-sollet';
import { SolongWalletAdapter, SolongWalletAdapterConfig } from '@solana/wallet-adapter-solong';
import { TorusWalletAdapter, TorusWalletAdapterConfig } from '@solana/wallet-adapter-torus';

export enum WalletName {
    Phantom = 'Phantom',
    Torus = 'Torus',
    Ledger = 'Ledger',
    Solong = 'Solong',
    MathWallet = 'MathWallet',
    Sollet = 'Sollet',
    // WalletConnect = 'WalletConnect',
}

export interface Wallet {
    name: WalletName;
    url: string;
    icon: string;
    adapter: () => WalletAdapter;
}

export const ICONS_URL = 'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/icons';

export const getPhantomWallet = (config?: PhantomWalletAdapterConfig): Wallet => ({
    name: WalletName.Phantom,
    url: 'https://www.phantom.app',
    icon: `${ICONS_URL}/phantom.png`,
    adapter: () => new PhantomWalletAdapter(config),
});

export const getTorusWallet = (config: TorusWalletAdapterConfig): Wallet => ({
    name: WalletName.Torus,
    url: 'https://tor.us',
    icon: `${ICONS_URL}/torus.svg`,
    adapter: () => new TorusWalletAdapter(config),
});

export const getLedgerWallet = (config?: LedgerWalletAdapterConfig): Wallet => ({
    name: WalletName.Ledger,
    url: 'https://www.ledger.com',
    icon: `${ICONS_URL}/ledger.svg`,
    adapter: () => new LedgerWalletAdapter(config),
});

export const getSolongWallet = (config?: SolongWalletAdapterConfig): Wallet => ({
    name: WalletName.Solong,
    url: 'https://solongwallet.com',
    icon: `${ICONS_URL}/solong.png`,
    adapter: () => new SolongWalletAdapter(config),
});

export const getMathWallet = (config?: MathWalletWalletAdapterConfig): Wallet => ({
    name: WalletName.MathWallet,
    url: 'https://mathwallet.org',
    icon: `${ICONS_URL}/mathwallet.svg`,
    adapter: () => new MathWalletWalletAdapter(config),
});

export const getSolletWallet = (config?: SolletWalletAdapterConfig): Wallet => ({
    name: WalletName.Sollet,
    url: 'https://www.sollet.io',
    icon: `${ICONS_URL}/sollet.svg`,
    adapter: () => new SolletWalletAdapter(config),
});

// @FIXME:
// export const getWalletConnectWallet = (config?: WalletConnectWalletAdapterConfig): Wallet => ({
//     name: WalletName.WalletConnect,
//     url: 'https://walletconnect.org',
//     icon: `${ASSETS_URL}/walletconnect.svg`,
//     adapter: () => new WalletConnectWalletAdapter(config),
// });
