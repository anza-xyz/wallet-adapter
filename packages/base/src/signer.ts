import { Connection, SendOptions, Transaction, TransactionSignature } from '@solana/web3.js';
import { BaseWalletAdapter, WalletAdapter } from './adapter';
import { WalletError, WalletNotConnectedError, WalletSendTransactionError } from './errors';

export interface SignerWalletAdapterProps {
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transaction: Transaction[]): Promise<Transaction[]>;
}

export type SignerWalletAdapter = WalletAdapter & SignerWalletAdapterProps;

export abstract class BaseSignerWalletAdapter extends BaseWalletAdapter implements SignerWalletAdapter {
    async sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options?: SendOptions
    ): Promise<TransactionSignature> {
        try {
            const publicKey = this.publicKey;
            if (!publicKey) throw new WalletNotConnectedError();

            const { blockhash } = await connection.getRecentBlockhash('max');

            transaction.feePayer = publicKey;
            transaction.recentBlockhash = blockhash;

            transaction = await this.signTransaction(transaction);

            const rawTransaction = transaction.serialize();

            return await connection.sendRawTransaction(rawTransaction, options);
        } catch (error) {
            if (!(error instanceof WalletError)) {
                error = new WalletSendTransactionError(error.message, error);
            }
            this.emit('error', error);
            throw error;
        }
    }

    abstract signTransaction(transaction: Transaction): Promise<Transaction>;
    abstract signAllTransactions(transaction: Transaction[]): Promise<Transaction[]>;
}
