import type { EventEmitter, SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    isVersionedTransaction,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSendTransactionError,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type {
    Connection,
    Transaction,
    TransactionSignature,
    TransactionVersion,
    VersionedTransaction,
} from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

interface NufiWalletEvents {
    connect(): void;
    disconnect(): void;
}

interface NufiWallet extends EventEmitter<NufiWalletEvents> {
    isNufi?: boolean;
    publicKey?: { toBytes(): Uint8Array };
    isConnected: boolean;
    signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
    signAndSendTransaction<T extends Transaction | VersionedTransaction>(
        transaction: T
    ): Promise<{ signature: TransactionSignature }>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    connect(): Promise<void>;
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
    supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0]);

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

    get publicKey() {
        return this._publicKey;
    }

    get connecting() {
        return this._connecting;
    }

    get connected() {
        return !!this._wallet?.isConnected;
    }

    get readyState() {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this._connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const wallet = window.nufiSolana!;

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

    async sendTransaction<T extends Transaction | VersionedTransaction>(
        transaction: T,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const { signers, ...sendOptions } = options;

                if (isVersionedTransaction(transaction)) {
                    signers?.length && transaction.sign(signers);
                } else {
                    transaction = (await this.prepareTransaction(transaction, connection, sendOptions)) as T;
                    signers?.length && (transaction as Transaction).partialSign(...signers);
                }

                sendOptions.preflightCommitment = sendOptions.preflightCommitment || connection.commitment;
                const { signature } = await wallet.signAndSendTransaction(transaction);
                return signature;
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletSendTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
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

    async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
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
                throw new WalletSignMessageError(error?.message, error);
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
