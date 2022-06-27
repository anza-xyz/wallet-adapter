import {
    BaseMessageSignerWalletAdapter,
    scopePollingDetectionStrategy,
    SendTransactionOptions,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletError,
    WalletName,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import { Connection, PublicKey, SendOptions, Transaction, TransactionSignature } from '@solana/web3.js';

interface NufiEvents {
    connect(): void;
    disconnect(): void;
}

/** The type of the connector object injected by the NuFi extension.
 *
 * Note that the interface uses some objects from `@solana/web3.js`. It is
 * guaranteed that NuFi uses at least version `1.42.0` of this library.
 */
interface NufiWallet {
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

interface NufiWindow extends Window {
    nufiSolana?: NufiWallet;
}

declare const window: NufiWindow;

export interface NufiWalletAdapterConfig {}

export const NufiWalletName = 'NuFi' as WalletName<'NuFi'>;

export class NufiWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = NufiWalletName;
    url = 'https://nu.fi';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIiIGhlaWdodD0iMjMiIHZpZXdCb3g9IjAgMCAyMiAyMyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzIxMjEyMSIgLz4KPHBhdGggZD0iTTQuMzA5OTkgOS4wMDAwOEM1LjMwODc3IDYuMjA0MDEgNy45ODA2OSA0LjIwMzA4IDExLjEyIDQuMjAzMDhDMTQuMjU5MiA0LjIwMzA4IDE2LjkzMTEgNi4yMDQwMSAxNy45Mjk5IDkuMDAwMDhDMTcuOTc5IDkuMTM3NDcgMTguMTA3NCA5LjIzMjE4IDE4LjI1MzMgOS4yMzIxOEgyMS4wNTk0QzIxLjI3MjUgOS4yMzIxOCAyMS40MzE3IDkuMDM1NzYgMjEuMzc5NCA4LjgyOTE5QzIwLjIxOTUgNC4yNDM2MiAxNi4wNjYgMC44NTAzNDIgMTEuMTIgMC44NTAzNDJDNi4xNzM5MSAwLjg1MDM0MiAyLjAyMDQyIDQuMjQzNjIgMC44NjA0NjggOC44MjkxOEMwLjgwODIxMyA5LjAzNTc2IDAuOTY3NDM0IDkuMjMyMTggMS4xODA1MiA5LjIzMjE4SDMuOTg2NTlDNC4xMzI0OSA5LjIzMjE4IDQuMjYwOTEgOS4xMzc0NyA0LjMwOTk5IDkuMDAwMDhaIiBmaWxsPSIjQzZGRjAwIi8+CjxwYXRoIGQ9Ik0zLjk4NjU5IDEzLjYzMjdDNC4xMzI0OSAxMy42MzI3IDQuMjYwOTEgMTMuNzI3NCA0LjMwOTk5IDEzLjg2NDhDNS4zMDg3NyAxNi42NjA4IDcuOTgwNjkgMTguNjYxOCAxMS4xMiAxOC42NjE4QzE0LjI1OTIgMTguNjYxOCAxNi45MzExIDE2LjY2MDggMTcuOTI5OSAxMy44NjQ4QzE3Ljk3OSAxMy43Mjc0IDE4LjEwNzQgMTMuNjMyNyAxOC4yNTMzIDEzLjYzMjdIMjEuMDU5NEMyMS4yNzI1IDEzLjYzMjcgMjEuNDMxNyAxMy44MjkxIDIxLjM3OTQgMTQuMDM1N0MyMC4yMTk1IDE4LjYyMTIgMTYuMDY2IDIyLjAxNDUgMTEuMTIgMjIuMDE0NUM2LjE3MzkxIDIyLjAxNDUgMi4wMjA0MiAxOC42MjEyIDAuODYwNDY4IDE0LjAzNTdDMC44MDgyMTMgMTMuODI5MSAwLjk2NzQzNCAxMy42MzI3IDEuMTgwNTIgMTMuNjMyN0gzLjk4NjU5WiIgZmlsbD0iI0M2RkYwMCIvPgo8cGF0aCBkPSJNOS4yNTQ5OSA5LjIzMjE4QzkuMDY5ODMgOS4yMzIxOCA4LjkxOTcyIDkuMzgyMjkgOC45MTk3MiA5LjU2NzQ2VjEzLjI5NzRDOC45MTk3MiAxMy40ODI1IDkuMDY5ODMgMTMuNjMyNyA5LjI1NDk5IDEzLjYzMjdIMTIuOTg0OUMxMy4xNzAxIDEzLjYzMjcgMTMuMzIwMiAxMy40ODI1IDEzLjMyMDIgMTMuMjk3NFY5LjU2NzQ2QzEzLjMyMDIgOS4zODIyOSAxMy4xNzAxIDkuMjMyMTggMTIuOTg0OSA5LjIzMjE4SDkuMjU0OTlaIiBmaWxsPSIjQzZGRjAwIi8+Cjwvc3ZnPgo=';

    private _connecting = false;
    private _wallet: NufiWallet | null = null;
    private _publicKey: PublicKey | null = null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: NufiWalletAdapterConfig = {}) {
        super();

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.nufiSolana?.isNufi) {
                    this._readyState = WalletReadyState.Installed;
                    this.emit('readyStateChange', this._readyState);
                    return true;
                }
                return false;
            });
        }
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._wallet?.isConnected;
    }

    get readyState(): WalletReadyState {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this._connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const wallet = window!.nufiSolana!;

            if (!wallet.isConnected) {
                try {
                    await wallet.connect();
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
                }
            }

            if (!wallet.publicKey) throw new WalletAccountError();

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(wallet.publicKey.toBytes());
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            wallet.on('disconnect', this._disconnected);

            this._wallet = wallet;
            this._publicKey = publicKey;

            this.emit('connect', publicKey);
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        const wallet = this._wallet;
        if (wallet) {
            wallet.off('disconnect', this._disconnected);

            this._wallet = null;
            this._publicKey = null;

            try {
                await wallet.disconnect();
            } catch (error: any) {
                this.emit('error', new WalletDisconnectionError(error?.message, error));
            }
        }

        this.emit('disconnect');
    }

    async sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options?: SendTransactionOptions
    ): Promise<TransactionSignature> {
        try {
            const wallet = this._wallet;
            if (wallet) {
                const { signature } = await wallet.signAndSendTransaction(transaction);
                return signature;
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }

        return await super.sendTransaction(transaction, connection, options);
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return (await wallet.signTransaction(transaction)) || transaction;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return (await wallet.signAllTransactions(transactions)) || transactions;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const { signature } = await wallet.signMessage(message);
                return signature;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    private _disconnected = () => {
        const wallet = this._wallet;
        if (wallet) {
            wallet.off('disconnect', this._disconnected);

            this._wallet = null;
            this._publicKey = null;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };
}
