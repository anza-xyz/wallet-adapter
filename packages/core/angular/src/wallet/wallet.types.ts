import { Adapter, Wallet, WalletName } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';

export interface WalletState {
    wallets: Wallet[];
    name: WalletName | null;
    wallet: Wallet | null;
    adapter: Adapter | null;
    connecting: boolean;
    disconnecting: boolean;
    connected: boolean;
    ready: boolean;
    publicKey: PublicKey | null;
    autoConnect: boolean;
}

export interface WalletConfig {
    wallets: Wallet[];
    localStorageKey?: string;
    autoConnect?: boolean;
    onError?: (error: unknown) => void;
}
