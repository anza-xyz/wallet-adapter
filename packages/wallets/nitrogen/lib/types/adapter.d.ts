import type { WalletName } from '@solana/wallet-adapter-base';
import { BaseMessageSignerWalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base';
import type { Transaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
export interface NitrogenWalletAdapterConfig {
}
export declare const NitrogenWalletName: WalletName<string>;
export declare class NitrogenWalletAdapter extends BaseMessageSignerWalletAdapter {
    name: WalletName<string>;
    url: string;
    icon: string;
    private _connecting;
    private _wallet;
    private _publicKey;
    private _readyState;
    constructor(config?: NitrogenWalletAdapterConfig);
    get publicKey(): PublicKey | null;
    get connecting(): boolean;
    get connected(): boolean;
    get readyState(): WalletReadyState;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signMessage(message: Uint8Array): Promise<Uint8Array>;
}
