import type { Transaction, TransactionSignature } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import type { SendTransactionOptions, WalletAdapter } from './adapter';
import { BaseWalletAdapter } from './adapter';
import { WalletSendTransactionError, WalletSignTransactionError } from './errors';

export interface SignerWalletAdapterProps {
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transaction: Transaction[]): Promise<Transaction[]>;
}

export type SignerWalletAdapter = WalletAdapter & SignerWalletAdapterProps;

export abstract class BaseSignerWalletAdapter extends BaseWalletAdapter implements SignerWalletAdapter {
    async sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        let emit = true;
        try {
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
        } catch (error: any) {
            if (emit) {
                this.emit('error', error);
            }
            throw error;
        }
    }

    abstract signTransaction(transaction: Transaction): Promise<Transaction>;

    async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        const signedTransactions: Transaction[] = [];
        for (const transaction of transactions) {
            signedTransactions.push(await this.signTransaction(transaction));
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
