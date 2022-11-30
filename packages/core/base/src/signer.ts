import type { Connection, TransactionSignature } from '@solana/web3.js';
import type { SendTransactionOptions, WalletAdapter, WalletAdapterProps } from './adapter.js';
import { BaseWalletAdapter } from './adapter.js';
import { WalletSendTransactionError, WalletSignTransactionError } from './errors.js';
import type { TransactionOrVersionedTransaction } from './types.js';
import { isVersionedTransaction } from './types.js';

export interface SignerWalletAdapterProps<Name extends string = string> extends WalletAdapterProps<Name> {
    signTransaction<T extends TransactionOrVersionedTransaction<this['supportedTransactionVersions']>>(
        transaction: T
    ): Promise<T>;
    signAllTransactions<T extends TransactionOrVersionedTransaction<this['supportedTransactionVersions']>>(
        transactions: T[]
    ): Promise<T[]>;
}

export type SignerWalletAdapter<Name extends string = string> = WalletAdapter<Name> & SignerWalletAdapterProps<Name>;

export abstract class BaseSignerWalletAdapter<Name extends string = string>
    extends BaseWalletAdapter<Name>
    implements SignerWalletAdapter<Name>
{
    async sendTransaction(
        transaction: TransactionOrVersionedTransaction<this['supportedTransactionVersions']>,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        let emit = true;
        try {
            if (isVersionedTransaction(transaction)) {
                if (!this.supportedTransactionVersions)
                    throw new WalletSendTransactionError(
                        `Sending versioned transactions isn't supported by this wallet`
                    );

                if (!this.supportedTransactionVersions.has(transaction.version))
                    throw new WalletSendTransactionError(
                        `Sending transaction version ${transaction.version} isn't supported by this wallet`
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

    abstract signTransaction<T extends TransactionOrVersionedTransaction<this['supportedTransactionVersions']>>(
        transaction: T
    ): Promise<T>;

    async signAllTransactions<T extends TransactionOrVersionedTransaction<this['supportedTransactionVersions']>>(
        transactions: T[]
    ): Promise<T[]> {
        for (const transaction of transactions) {
            if (isVersionedTransaction(transaction)) {
                if (!this.supportedTransactionVersions)
                    throw new WalletSignTransactionError(
                        `Signing versioned transactions isn't supported by this wallet`
                    );

                if (!this.supportedTransactionVersions.has(transaction.version))
                    throw new WalletSignTransactionError(
                        `Signing transaction version ${transaction.version} isn't supported by this wallet`
                    );
            }
        }

        const signedTransactions: T[] = [];
        for (const transaction of transactions) {
            signedTransactions.push(await this.signTransaction(transaction));
        }
        return signedTransactions;
    }
}

export interface MessageSignerWalletAdapterProps<Name extends string = string> extends WalletAdapterProps<Name> {
    signMessage(message: Uint8Array): Promise<Uint8Array>;
}

export type MessageSignerWalletAdapter<Name extends string = string> = WalletAdapter<Name> &
    MessageSignerWalletAdapterProps<Name>;

export abstract class BaseMessageSignerWalletAdapter<Name extends string = string>
    extends BaseSignerWalletAdapter<Name>
    implements MessageSignerWalletAdapter<Name>
{
    abstract signMessage(message: Uint8Array): Promise<Uint8Array>;
}
