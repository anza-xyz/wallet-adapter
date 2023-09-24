import type { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

interface SolanaEvent {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
    accountChanged(newPublicKey: PublicKey): unknown;
}

interface SolanaEventEmitter {
    on<E extends keyof SolanaEvent>(event: E, listener: SolanaEvent[E], context?: any): void;
    off<E extends keyof SolanaEvent>(event: E, listener: SolanaEvent[E], context?: any): void;
}

interface SignTransactionInput<T extends Transaction | VersionedTransaction> {
    transaction: T;
}

interface SignTransactionOutput<T extends Transaction | VersionedTransaction> {
    signedTransaction: T;
}

interface SignAllTransactionsInput<T extends Transaction | VersionedTransaction> {
    transactions: T[];
}

interface SignAllTransactionsOutput<T extends Transaction | VersionedTransaction> {
    signedTransactions: T[];
}

interface SignAndSendTransactionInput {
    transaction: Transaction | VersionedTransaction;
}

export interface Solana extends SolanaEventEmitter {
    publicKey: PublicKey | null;
    connected: boolean;
    connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: PublicKey }>;
    disconnect(): Promise<void>;
    signTransaction<T extends Transaction | VersionedTransaction>(
        input: SignTransactionInput<T>
    ): Promise<SignTransactionOutput<T>>;
    signAndSendTransaction(input: SignAndSendTransactionInput): Promise<string>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(
        input: SignAllTransactionsInput<T>
    ): Promise<SignAllTransactionsOutput<T>>;
    signMessage(message: Uint8Array): Promise<Uint8Array>;
}
