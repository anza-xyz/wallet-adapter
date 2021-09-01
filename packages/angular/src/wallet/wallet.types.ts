import { MessageSignerWalletAdapter, SignerWalletAdapter, WalletAdapter } from '@solana/wallet-adapter-base';

export interface WalletState {
    wallets: Wallet[];
    selectedWallet: WalletName | null;
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
}
