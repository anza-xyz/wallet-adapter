import { Adapter, Wallet } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';

export interface WalletState {
    wallets: Wallet[];
    wallet: Wallet | null;
    adapter: Adapter | null;
    connecting: boolean;
    disconnecting: boolean;
    unloading: boolean;
    connected: boolean;
    ready: boolean;
    publicKey: PublicKey | null;
    autoConnect: boolean;
}

export interface WalletConfig {
    localStorageKey?: string;
    autoConnect?: boolean;
    onError?: (error: unknown) => void;
}
