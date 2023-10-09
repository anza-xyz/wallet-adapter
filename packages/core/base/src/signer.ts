import type { SolanaSignInInput, SolanaSignInOutput } from '@solana/wallet-standard-features';
import {
    BaseWalletAdapter,
    SolanaRpc,
    type SendTransactionOptions,
    type WalletAdapter,
    type WalletAdapterProps,
} from './adapter.js';
import { WalletSendTransactionError, WalletSignTransactionError } from './errors.js';
import {
    Transaction,
    TransactionSignature,
    getBase64EncodedWireTransaction,
    ITransactionWithFeePayer,
    ITransactionWithBlockhashLifetime,
    ITransactionWithSignatures,
} from 'web3js-experimental';

type CompilableTransaction = Transaction &
    ITransactionWithFeePayer &
    // Excluding durable nonce from wallet-adapter for now
    ITransactionWithBlockhashLifetime;

export interface SignerWalletAdapterProps<Name extends string = string> extends WalletAdapterProps<Name> {
    signTransaction(transaction: CompilableTransaction): Promise<CompilableTransaction & ITransactionWithSignatures>;
    signAllTransactions(
        transactions: CompilableTransaction[]
    ): Promise<(CompilableTransaction & ITransactionWithSignatures)[]>;
}

export type SignerWalletAdapter<Name extends string = string> = WalletAdapter<Name> & SignerWalletAdapterProps<Name>;

export abstract class BaseSignerWalletAdapter<Name extends string = string>
    extends BaseWalletAdapter<Name>
    implements SignerWalletAdapter<Name>
{
    async sendTransaction(
        transaction: CompilableTransaction,
        rpc: SolanaRpc,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        let emit = true;
        try {
            // Just going to assume all supported wallets support versioned transactions here
            if (!this.supportedTransactionVersions?.has(transaction.version))
                throw new WalletSendTransactionError(
                    `Sending transaction version ${transaction.version} isn't supported by this wallet`
                );

            try {
                const signedTransaction = await this.signTransaction(transaction);
                const encodedTransaction = getBase64EncodedWireTransaction(signedTransaction);
                // sendTransaction should probably return TransactionSignature (or w/e we export from @solana/transactions)
                // https://github.com/solana-labs/solana-web3.js/issues/1709
                return (await rpc
                    .sendTransaction(encodedTransaction, {
                        ...options,
                        encoding: 'base64',
                    })
                    .send()) as unknown as TransactionSignature;
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

    abstract signTransaction(
        transaction: CompilableTransaction
    ): Promise<CompilableTransaction & ITransactionWithSignatures>;

    async signAllTransactions(
        transactions: CompilableTransaction[]
    ): Promise<(CompilableTransaction & ITransactionWithSignatures)[]> {
        for (const transaction of transactions) {
            // Just going to assume all supported wallets support versioned transactions here
            if (!this.supportedTransactionVersions?.has(transaction.version))
                throw new WalletSendTransactionError(
                    `Sending transaction version ${transaction.version} isn't supported by this wallet`
                );
        }

        const signedTransactions = [];
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

export interface SignInMessageSignerWalletAdapterProps<Name extends string = string> extends WalletAdapterProps<Name> {
    signIn(input?: SolanaSignInInput): Promise<SolanaSignInOutput>;
}

export type SignInMessageSignerWalletAdapter<Name extends string = string> = WalletAdapter<Name> &
    SignInMessageSignerWalletAdapterProps<Name>;

export abstract class BaseSignInMessageSignerWalletAdapter<Name extends string = string>
    extends BaseMessageSignerWalletAdapter<Name>
    implements SignInMessageSignerWalletAdapter<Name>
{
    abstract signIn(input?: SolanaSignInInput): Promise<SolanaSignInOutput>;
}
