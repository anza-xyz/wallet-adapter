import { Connection, DurableNonce, NonceAccount, PublicKey, SystemProgram, Transaction, TransactionSignature } from "@solana/web3.js";
import { SendTransactionOptions, WalletAdapter, WalletAdapterProps } from "./adapter.js";
import { WalletNonceNotFoundError, WalletNoNonceError, WalletNotConnectedError, WalletSendTransactionError, WalletSignTransactionError } from "./errors.js";
import { BaseMessageSignerWalletAdapter } from "./signer.js";
import { isVersionedTransaction, TransactionOrVersionedTransaction } from "./transaction.js";


export interface NonceContainer {
    nonceAccount: PublicKey
    nonceAuthority: PublicKey
    currentNonce: DurableNonce
}

export interface NonceWalletAdapterProps<Name extends string = string> extends WalletAdapterProps<Name> {
    nonceContainer: NonceContainer | null;
}

export type NonceWalletAdapter<Name extends string = string> = WalletAdapter<Name> &
    NonceWalletAdapterProps<Name>;

export abstract class BaseNonceWalletAdapter<Name extends string = string>
    extends BaseMessageSignerWalletAdapter<Name>
    implements NonceWalletAdapter<Name>

{
    abstract nonceContainer: NonceContainer | null;

    async sendTransaction(
        transaction: TransactionOrVersionedTransaction<this['supportedTransactionVersions']>,
        connection: Connection,
        options: SendTransactionOptions = {},
    ): Promise<TransactionSignature> {
        const { useNonce } = options;
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

                    if (useNonce && this.nonceContainer) {
                        transaction = await this.prepareNonceTransaction(transaction, this.nonceContainer);
                    }
                    else {
                        transaction = await this.prepareTransaction(transaction, connection, sendOptions);
                    }

                    signers?.length && transaction.partialSign(...signers);

                    transaction = await this.signTransaction(transaction);

                    const rawTransaction = transaction.serialize();

                    const result = await connection.sendRawTransaction(rawTransaction, sendOptions);

                    if (useNonce && this.nonceContainer) {
                        this.updateNonce(connection, result);
                    }
                    return result;

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
    protected async prepareNonceTransaction(
        transaction: Transaction,
        nonceContainer: NonceContainer
    ): Promise<Transaction> {
        const publicKey = this.publicKey;
        if (!publicKey) throw new WalletNotConnectedError();
        if (!nonceContainer) throw new WalletNonceNotFoundError();
        const advanceNonceInstruction = SystemProgram.nonceAdvance({
            noncePubkey: nonceContainer.nonceAccount,
            authorizedPubkey: nonceContainer.nonceAuthority,
        });
        const transactionWithNonce = new Transaction().add(advanceNonceInstruction);
        transactionWithNonce.add(transaction);
        transactionWithNonce.recentBlockhash = nonceContainer.currentNonce;
        transactionWithNonce.feePayer = transaction.feePayer || publicKey;

        return transactionWithNonce;
    }
    protected async updateNonce(connection: Connection, signature?: TransactionSignature) {
        if (signature && this.nonceContainer) {
            await connection.confirmTransaction(
                {
                    signature,
                    minContextSlot: 0,
                    nonceAccountPubkey: this.nonceContainer?.nonceAccount,
                    nonceValue: this.nonceContainer?.currentNonce
                }, 'confirmed'
            );
        }
        if (!this.nonceContainer) throw new WalletNoNonceError();
        const nonceAccount = await this.fetchNonceInfo(connection, this.nonceContainer.nonceAccount);
        this.nonceContainer.currentNonce = nonceAccount.nonce;
    };
    protected async fetchNonceInfo(connection: Connection, noncePubkey: PublicKey) {
        const accountInfo = await connection.getAccountInfo(noncePubkey);
        if (!accountInfo) throw new WalletNonceNotFoundError();
        const nonceAccount = NonceAccount.fromAccountData(accountInfo.data);
        return nonceAccount;
    }
}
