import type { Adapter, MessageSignerWalletAdapterProps, SendTransactionOptions, SignerWalletAdapterProps, Wallet, WalletError, WalletName } from '@solana/wallet-adapter-base';
import type { Connection, PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';
declare type ErrorHandler = (error: WalletError) => void;
declare type WalletConfig = Pick<WalletStore, 'wallets' | 'autoConnect' | 'localStorageKey' | 'onError'>;
declare type WalletStatus = Pick<WalletStore, 'connected' | 'publicKey'>;
interface WalletStore {
    autoConnect: boolean;
    wallets: Wallet[];
    adapter: Adapter | null;
    connected: boolean;
    connecting: boolean;
    disconnecting: boolean;
    localStorageKey: string;
    onError: ErrorHandler;
    publicKey: PublicKey | null;
    ready: boolean;
    wallet: Wallet | null;
    walletsByName: Record<WalletName, Wallet>;
    name: WalletName | null;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    select(walletName: WalletName): void;
    sendTransaction(transaction: Transaction, connection: Connection, options?: SendTransactionOptions): Promise<TransactionSignature>;
    signAllTransactions: SignerWalletAdapterProps['signAllTransactions'] | undefined;
    signMessage: MessageSignerWalletAdapterProps['signMessage'] | undefined;
    signTransaction: SignerWalletAdapterProps['signTransaction'] | undefined;
}
export declare const walletStore: {
    resetWallet: () => void;
    setConnecting: (connecting: boolean) => void;
    setDisconnecting: (disconnecting: boolean) => void;
    setReady: (ready: boolean) => void;
    subscribe: (this: void, run: import("svelte/store").Subscriber<WalletStore>, invalidate?: ((value?: WalletStore | undefined) => void) | undefined) => import("svelte/store").Unsubscriber;
    updateConfig: (walletConfig: WalletConfig & {
        walletsByName: Record<WalletName, Wallet>;
    }) => void;
    updateStatus: (walletStatus: WalletStatus) => void;
    updateWallet: (walletName: WalletName) => void;
};
export declare function initialize({ wallets, autoConnect, localStorageKey, onError, }: WalletConfig): Promise<void>;
export {};
