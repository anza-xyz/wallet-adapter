import { BaseMessageSignerWalletAdapter, WalletName, WalletReadyState } from '@solana/wallet-adapter-base';
import { Connection, PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';
import { SendTransactionOptions } from '@solana/wallet-adapter-base';
export interface SkyWalletAdapterConfig {
}
export declare const SkyWalletName: WalletName<"SKY Wallet">;
export declare class SkyWalletAdapter extends BaseMessageSignerWalletAdapter {
    name: WalletName<"SKY Wallet">;
    url: string;
    icon: string;
    private _connecting;
    private _wallet;
    private _publicKey;
    private _readyState;
    constructor(config?: SkyWalletAdapterConfig);
    get publicKey(): PublicKey | null;
    get connecting(): boolean;
    get connected(): boolean;
    get readyState(): WalletReadyState;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendTransaction(transaction: Transaction, connection: Connection, options?: SendTransactionOptions): Promise<TransactionSignature>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signMessage(message: Uint8Array): Promise<Uint8Array>;
    private _disconnected;
}
