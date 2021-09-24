import { Connection, Transaction, TransactionSignature } from '@solana/web3.js';
import { BaseWalletAdapter, SendTransactionOptions, WalletAdapter } from './adapter';
import { WalletError, WalletSendTransactionError } from './errors';

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
        try {
            try {
                transaction.feePayer ||= this.publicKey || undefined;
                transaction.recentBlockhash ||= (await connection.getRecentBlockhash('finalized')).blockhash;

                const { signers, ...sendOptions } = options;

                signers?.length && transaction.partialSign(...signers);

                transaction = await this.signTransaction(transaction);

                const rawTransaction = transaction.serialize();

                return await connection.sendRawTransaction(rawTransaction, sendOptions);
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletSendTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    abstract signTransaction(transaction: Transaction): Promise<Transaction>;
    abstract signAllTransactions(transaction: Transaction[]): Promise<Transaction[]>;
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
