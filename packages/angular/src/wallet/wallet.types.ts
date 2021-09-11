import { MessageSignerWalletAdapter, SignerWalletAdapter, WalletAdapter } from '@solana/wallet-adapter-base';
import { Wallet, WalletName } from '@solana/wallet-adapter-wallets';
import { PublicKey } from '@solana/web3.js';

export interface WalletState {
    wallets: Wallet[];
    name: WalletName | null;
    wallet: Wallet | null;
    adapter: WalletAdapter | SignerWalletAdapter | MessageSignerWalletAdapter | null;
    connecting: boolean;
    disconnecting: boolean;
    connected: boolean;
    ready: boolean;
    publicKey: PublicKey | null;
    autoApprove: boolean;
}

export interface WalletConfig {
    wallets: Wallet[];
    localStorageKey?: string;
    autoConnect?: boolean;
    onError?: (error: unknown) => void;
}
