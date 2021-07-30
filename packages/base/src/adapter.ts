import { PublicKey, Transaction } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';
import { WalletError } from './errors';

export { EventEmitter };

export interface WalletAdapterEvents {
    ready: () => void;
    connect: () => void;
    disconnect: () => void;
    error: (error: WalletError) => void;
}

export interface WalletAdapter extends EventEmitter<WalletAdapterEvents> {
    publicKey: PublicKey | null;
    ready: boolean;
    connecting: boolean;
    connected: boolean;
    autoApprove: boolean;

    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    signTransaction: (transaction: Transaction) => Promise<Transaction>;
    signAllTransactions: (transaction: Transaction[]) => Promise<Transaction[]>;
}

export enum WalletAdapterNetwork {
    Mainnet = 'mainnet-beta',
    Testnet = 'testnet',
    Devnet = 'devnet',
}
