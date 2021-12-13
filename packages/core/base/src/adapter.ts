import { Connection, PublicKey, SendOptions, Signer, Transaction, TransactionSignature } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';
import { WalletError } from './errors';

export { EventEmitter };

export interface WalletAdapterEvents {
    connect(): void;
    disconnect(): void;
    error(error: WalletError): void;
}

export interface SendTransactionOptions extends SendOptions {
    signers?: Signer[];
}

export interface WalletAdapterProps {
    publicKey: PublicKey | null;
    connecting: boolean;
    connected: boolean;

    ready(): Promise<boolean>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options?: SendTransactionOptions
    ): Promise<TransactionSignature>;
}

export type WalletAdapter = WalletAdapterProps & EventEmitter<WalletAdapterEvents>;

export abstract class BaseWalletAdapter extends EventEmitter<WalletAdapterEvents> implements WalletAdapter {
    abstract publicKey: PublicKey | null;
    abstract connecting: boolean;

    get connected(): boolean {
        return !!this.publicKey;
    }

    abstract ready(): Promise<boolean>;
    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options?: SendTransactionOptions
    ): Promise<TransactionSignature>;
}

export enum WalletAdapterNetwork {
    Mainnet = 'mainnet-beta',
    Testnet = 'testnet',
    Devnet = 'devnet',
}
