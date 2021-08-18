import { Connection, PublicKey, SendOptions, Transaction, TransactionSignature } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';
import { WalletError } from './errors';

export { EventEmitter };

export interface WalletAdapterEvents {
    ready(): void;
    connect(): void;
    disconnect(): void;
    error(error: WalletError): void;
}

export interface WalletAdapterProps {
    publicKey: PublicKey | null;
    ready: boolean;
    connecting: boolean;
    connected: boolean;
    autoApprove: boolean;

    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options?: SendOptions
    ): Promise<TransactionSignature>;
}

export type WalletAdapter = WalletAdapterProps & EventEmitter<WalletAdapterEvents>;

export abstract class BaseWalletAdapter extends EventEmitter<WalletAdapterEvents> implements WalletAdapter {
    abstract publicKey: PublicKey | null;
    abstract ready: boolean;
    abstract connecting: boolean;
    abstract connected: boolean;
    abstract autoApprove: boolean;

    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options?: SendOptions
    ): Promise<TransactionSignature>;
}

export enum WalletAdapterNetwork {
    Mainnet = 'mainnet-beta',
    Testnet = 'testnet',
    Devnet = 'devnet',
}
