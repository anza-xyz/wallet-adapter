import type { Connection, TransactionSignature, TransactionVersion } from '@solana/web3.js';
import type { SendTransactionOptions, WalletAdapter, WalletAdapterProps } from './adapter.js';
import { BaseWalletAdapter } from './adapter.js';
import { WalletSendTransactionError, WalletSignTransactionError } from './errors.js';
import type { TransactionOrVersionedTransaction } from './types.js';

export interface SignerWalletAdapterProps<
    Name extends string = string,
    SupportedTransactionVersions extends Set<TransactionVersion> | null = Set<TransactionVersion> | null
> extends WalletAdapterProps<Name, SupportedTransactionVersions> {
    signTransaction(
        transaction: TransactionOrVersionedTransaction<SupportedTransactionVersions>
    ): Promise<TransactionOrVersionedTransaction<SupportedTransactionVersions>>;
    signAllTransactions(
        transactions: TransactionOrVersionedTransaction<SupportedTransactionVersions>[]
    ): Promise<TransactionOrVersionedTransaction<SupportedTransactionVersions>[]>;
}

export type SignerWalletAdapter<
    Name extends string = string,
    SupportedTransactionVersions extends Set<TransactionVersion> | null = Set<TransactionVersion> | null
> = WalletAdapter<Name, SupportedTransactionVersions> & SignerWalletAdapterProps<Name, SupportedTransactionVersions>;

export abstract class BaseSignerWalletAdapter<
        Name extends string = string,
        SupportedTransactionVersions extends Set<TransactionVersion> | null = Set<TransactionVersion> | null
    >
    extends BaseWalletAdapter<Name, SupportedTransactionVersions>
    implements SignerWalletAdapter<Name, SupportedTransactionVersions>
{
    async sendTransaction(
        transaction: TransactionOrVersionedTransaction<SupportedTransactionVersions>,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        let emit = true;
        try {
            if ('message' in transaction) {
                if (!this.supportedTransactionVersions)
                    throw new WalletSendTransactionError(
                        `Sending versioned transactions isn't supported by this wallet`
                    );

                const { version } = transaction.message;
                if (!this.supportedTransactionVersions.has(version))
                    throw new WalletSendTransactionError(
                        `Sending transaction version ${version} isn't supported by this wallet`
                    );

                try {
                    transaction = await this.signTransaction(transaction);

                    const rawTransaction = transaction.serialize();

                    return await connection.sendRawTransaction(rawTransaction, options);
                } catch (error: any) {
                    // If the error was thrown by `signTransaction`, rethrow it and don't emit a duplicate event
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

    abstract signTransaction(
        transaction: TransactionOrVersionedTransaction<SupportedTransactionVersions>
    ): Promise<TransactionOrVersionedTransaction<SupportedTransactionVersions>>;

    async signAllTransactions(
        transactions: TransactionOrVersionedTransaction<SupportedTransactionVersions>[]
    ): Promise<TransactionOrVersionedTransaction<SupportedTransactionVersions>[]> {
        const signedTransactions: TransactionOrVersionedTransaction<SupportedTransactionVersions>[] = [];
        for (const transaction of transactions) {
            signedTransactions.push(await this.signTransaction(transaction));
        }
        return signedTransactions;
    }
}

export interface MessageSignerWalletAdapterProps<
    Name extends string = string,
    SupportedTransactionVersions extends Set<TransactionVersion> | null = Set<TransactionVersion> | null
> extends WalletAdapterProps<Name, SupportedTransactionVersions> {
    signMessage(message: Uint8Array): Promise<Uint8Array>;
}

export type MessageSignerWalletAdapter<
    Name extends string = string,
    SupportedTransactionVersions extends Set<TransactionVersion> | null = Set<TransactionVersion> | null
> = WalletAdapter<Name, SupportedTransactionVersions> &
    MessageSignerWalletAdapterProps<Name, SupportedTransactionVersions>;

export abstract class BaseMessageSignerWalletAdapter<
        Name extends string = string,
        SupportedTransactionVersions extends Set<TransactionVersion> | null = Set<TransactionVersion> | null
    >
    extends BaseSignerWalletAdapter<Name, SupportedTransactionVersions>
    implements MessageSignerWalletAdapter<Name, SupportedTransactionVersions>
{
    abstract signMessage(message: Uint8Array): Promise<Uint8Array>;
}
