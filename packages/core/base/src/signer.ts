import type {
    Connection,
    Transaction,
    TransactionSignature,
    TransactionVersion,
    VersionedTransaction,
} from '@solana/web3.js';
import type { SendTransactionOptions, WalletAdapter } from './adapter.js';
import { BaseWalletAdapter } from './adapter.js';
import { WalletSendTransactionError, WalletSignTransactionError } from './errors.js';

export interface SignerWalletAdapterProps {
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signVersionedTransaction(transaction: VersionedTransaction): Promise<VersionedTransaction>;
    signAllTransactions(transaction: Transaction[]): Promise<Transaction[]>;
    signAllVersionedTransactions(transactions: VersionedTransaction[]): Promise<VersionedTransaction[]>;
}

export type SignerWalletAdapter = WalletAdapter & SignerWalletAdapterProps;

export abstract class BaseSignerWalletAdapter extends BaseWalletAdapter implements SignerWalletAdapter {
    supportedTransactionVersions: Set<TransactionVersion> | null = null;

    async sendTransaction(
        transaction: VersionedTransaction | Transaction,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        let emit = true;
        try {
            if ('message' in transaction) {
                const version = transaction.message.version;
                if (this.supportedTransactionVersions === null) {
                    throw new WalletSendTransactionError(
                        `Sending versioned transactions isn't supported by this wallet`
                    );
                } else if (!this.supportedTransactionVersions.has(version)) {
                    throw new WalletSendTransactionError(
                        `Sending transaction version ${version} isn't supported by this wallet`
                    );
                }

                try {
                    transaction = await this.signVersionedTransaction(transaction);

                    const rawTransaction = transaction.serialize();

                    return await connection.sendRawTransaction(rawTransaction, options);
                } catch (error: any) {
                    // If the error was thrown by `signVersionedTransaction`, rethrow it and don't emit a duplicate event
                    if (error instanceof WalletSignTransactionError) {
                        emit = false;
                        throw error;
                    }
                    throw new WalletSendTransactionError(error?.message, error);
                }
            } else {
                try {
                    const { signers, ...sendOptions } = options;

                    transaction = await this.prepareTransaction(transaction, connection, sendOptions);

                    signers?.length && transaction.partialSign(...signers);

                    transaction = await this.signTransaction(transaction);

                    const rawTransaction = transaction.serialize();

                    return await connection.sendRawTransaction(rawTransaction, sendOptions);
                } catch (error: any) {
                    // If the error was thrown by `signTransaction`, rethrow it and don't emit a duplicate event
                    if (error instanceof WalletSignTransactionError) {
                        emit = false;
                        throw error;
                    }
                    throw new WalletSendTransactionError(error?.message, error);
                }
            }
        } catch (error: any) {
            if (emit) {
                this.emit('error', error);
            }
            throw error;
        }
    }

    abstract signTransaction(transaction: Transaction): Promise<Transaction>;

    async signVersionedTransaction(transaction: VersionedTransaction): Promise<VersionedTransaction> {
        const error = new WalletSignTransactionError("Signing versioned transactions isn't supported by this wallet");
        this.emit('error', error);
        throw error;
    }

    async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        const signedTransactions: Transaction[] = [];
        for (const transaction of transactions) {
            signedTransactions.push(await this.signTransaction(transaction));
        }
        return signedTransactions;
    }

    async signAllVersionedTransactions(transactions: VersionedTransaction[]): Promise<VersionedTransaction[]> {
        const signedTransactions: VersionedTransaction[] = [];
        for (const transaction of transactions) {
            signedTransactions.push(await this.signVersionedTransaction(transaction));
        }
        return signedTransactions;
    }
}

export interface MessageSignerWalletAdapterProps {
    signMessage(message: Uint8Array): Promise<Uint8Array>;
}

export type MessageSignerWalletAdapter = WalletAdapter & MessageSignerWalletAdapterProps;

export abstract class BaseMessageSignerWalletAdapter
    extends BaseSignerWalletAdapter
    implements MessageSignerWalletAdapter
{
    abstract signMessage(message: Uint8Array): Promise<Uint8Array>;
}
