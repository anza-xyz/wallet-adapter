/* This file should be kept in sync between the NuFi and the `wallet-adapter`
 * codebases. */

import { Transaction, TransactionSignature } from '@solana/web3.js';

interface NufiEvents {
    connect(): void;
    disconnect(): void;
}

/** The type of the connector object injected by the NuFi extension.
 *
 * Note that the interface uses some objects from `@solana/web3.js`. It is
 * guaranteed that NuFi uses at least version `1.42.0` of this library.
 */
export interface NufiWallet {
    /** This always has the value `true`. */
    isNufi: boolean;

    /** This is `undefined` if any only if {@link isConnected} is `false`. */
    publicKey: undefined | { toBytes(): Uint8Array };

    /** This signals whether the wallet is connected. A change in this value is
     * always immediately followed by the {@link NufiEvents.connect} or the
     * {@link NufiEvents.disconnect} event being emitted. */
    isConnected: boolean;

    /** Subscribe to an event. */
    on: <T extends keyof NufiEvents>(event: T, fn: NufiEvents[T]) => void;

    /** Unsubscribe from an event. */
    off: <T extends keyof NufiEvents>(event: T, fn: NufiEvents[T]) => void;

    /** Request the signing of a transaction. This might take a long time, as
     * the user may be asked for their approval. If the promise is resolved, a
     * new signed `Transaction` object is returned. If the promise is rejected,
     * it can either mean that the user rejected the transaction, or any other
     * error. It is unspecified what is returned on rejection.
     * */
    signTransaction(transaction: Transaction): Promise<Transaction>;

    /**
     * The behavior is identical to that of {@link signTransaction}, except
     * that multiple transactions are requested to be signed. The promise is
     * only resolved if all transactions have been signed.
     */
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;

    /**
     * The behavior is identical to that of {@link signTransaction}, except
     * that if the transaction is succesfully signed, it is also submitted, and
     * only its signature is returned.
     */
    signAndSendTransaction(transaction: Transaction): Promise<{ signature: TransactionSignature }>;

    /**
     * Request the signing of a message. This might take a long time, as the user
     * may be asked for their approval. If the promise is resolved, the signature
     * is returned. If the promise is rejected, it can either mean that the user
     * rejected the signing the message, or any other error. It is unspecified
     * what is returned on rejection.
     */
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;

    /**
     * Request connecting to the wallet. This might take a long time, as the
     * user may be asked for their consent. Before the promise resolves, the
     * {@link NufiEvents.connect} event will be emitted. If the promise is
     * rejected, it can either mean that the user rejected the connection, or
     * any other error. It is unspecified what is returned on rejection.
     */
    connect(): Promise<void>;

    /**
     * Request disconnecting from the wallet. Before the promise resolves, the
     * {@link NufiEvents.disconnect} event will be emitted. The promise is
     * guaranteed to always resolve.
     */
    disconnect(): Promise<void>;
}
