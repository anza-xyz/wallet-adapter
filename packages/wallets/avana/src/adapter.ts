import type { EventEmitter, SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
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
import type { Connection, SendOptions, Transaction, TransactionSignature } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

interface AvanaWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface AvanaWallet extends EventEmitter<AvanaWalletEvents> {
    isAvana?: boolean;
    publicKey?: { toBytes(): Uint8Array };
    isConnected: boolean;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signAndSendTransaction(
        transaction: Transaction,
        options?: SendOptions
    ): Promise<{ signature: TransactionSignature }>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

interface AvanaWindow extends Window {
    avana?: {
        solana?: AvanaWallet;
    };
}

declare const window: AvanaWindow;

export interface AvanaWalletAdapterConfig {}

export const AvanaWalletName = 'Avana' as WalletName<'Avana'>;

export class AvanaWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = AvanaWalletName;
    url = 'https://www.avanawallet.com';
    icon =
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyNi4yLjEsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHZpZXdCb3g9IjAgMCAyODkuNzg3ODEgMjg5Ljc4NzgxIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyODkuNzg3ODEgMjg5Ljc4NzgxIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxwYXRoIGZpbGw9IiMxQzFDMUMiIGQ9Ik0yMTguNDM5MDEsMjg5Ljc4NzgxSDcxLjM0ODhDMzEuOTQzOTUsMjg5Ljc4NzgxLDAsMjU3Ljg0Mzg3LDAsMjE4LjQzOTAxVjcxLjM0ODgNCglDMCwzMS45NDM5NSwzMS45NDM5NSwwLDcxLjM0ODgsMGgxNDcuMDkwMjFjMzkuNDA0ODYsMCw3MS4zNDg4LDMxLjk0Mzk1LDcxLjM0ODgsNzEuMzQ4OHYxNDcuMDkwMjENCglDMjg5Ljc4NzgxLDI1Ny44NDM4NywyNTcuODQzODcsMjg5Ljc4NzgxLDIxOC40MzkwMSwyODkuNzg3ODF6Ii8+DQo8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjczLjU4NTUzIiB5MT0iMjE3Ljk4MDgzIiB4Mj0iMjA4LjY0NzQ5IiB5Mj0iLTY0LjU5NzU2IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIC0xIDAgMjkwLjc5MzAzKSI+DQoJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6IzE2RkVBOCIvPg0KCTxzdG9wICBvZmZzZXQ9IjAuNCIgc3R5bGU9InN0b3AtY29sb3I6IzAwREFGRiIvPg0KCTxzdG9wICBvZmZzZXQ9IjAuOTIiIHN0eWxlPSJzdG9wLWNvbG9yOiNEQzFGRkYiLz4NCgk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojREMxRkZGIi8+DQo8L2xpbmVhckdyYWRpZW50Pg0KPHBhdGggZmlsbD0idXJsKCNTVkdJRF8xXykiIGQ9Ik0yMzUuNzgxMjIsMjE3LjA0NTMzTDE1Ny43MjQ0Myw0OC40NTUyMmMtNS4wMzU4MS0xMC45MjA1NC0yMC41Mzk3Ni0xMC45MjA1NC0yNS41NzU1OSwwDQoJbC0zOS4xODM4OSw4NC41OTIxNGMtMS4xMDM0MiwyLjQwNDcyLTEuNjQwOTcsNC45NzkzNy0xLjY0MDk3LDcuNDY5MDZjMCw3LjEwMTA3LDQuMjQzNzUsMTMuODkxMTMsMTEuNDAxNDQsMTYuNjYzNjQNCgljOC44ODM2NCwzLjQ1MTY4LDE4LjkyNzEzLTEuMTAzMjMsMjIuOTQ0NjYtOS43NjA0OGw5Ljc4ODgyLTIxLjEzMzk2YzMuNzM0NTEtOC4wOTEzOCwxNS4yMjA5Mi04LjA5MTM4LDE4Ljk1NTQ2LDANCglsMTYuNDQ4MiwzNS41NTM0M2MyLjQxMjAyLDUuMjEzNjctMS43MDg5MiwxMS4wMjA4My03LjQzNzA5LDEwLjU4NzAxYy02Ny42NzI1LTUuMTI0OTQtMTA1LjA3MzAzLDM4LjcwMzA5LTEwNi4xNjQ3Niw0MC4wMDc3NA0KCWMtMC4wMjgxNCwwLjAyODMxLTAuMDI4MTQsMC4wMjgzMS0wLjAyODE0LDAuMDI4MzFjLTMuMDI3MjMsMy4xOTY5OS00Ljg5NDU4LDcuNDY5MDYtNC44OTQ1OCwxMi4yNTAxOA0KCWMwLDkuODE3MzEsNy45NDk5NCwxNy43NjcyNiwxNy43Mzg5MywxNy43NjcyNmM1LjE3NzQzLDAsOS44NDU0NS0yLjIzNDk5LDEzLjA5OTA1LTUuNzcxNDRjMCwwLDAuMDg0NzktMC4xMTMzLDAuMjU0NTMtMC4zMTEzNg0KCWMwLjExMzI4LTAuMTEzMTEsMC4yNTQ3MS0wLjI1NDUzLDAuMzk2MTMtMC40MjQyNmM0Ljk0NjEtNS4zMDEyNSwzNy42MTI0LTM3LjM5MDI3LDkyLjA2NjE1LTI2LjM1OTA3DQoJYzEyLjAxNzc4LDIuNDM0NTQsMjIuMDQ5NjgsMTAuNjgxNywyNy4yMTE2MiwyMS44MDQxNGwwLDBjMy4wMjcyMiw2LjUzNTM3LDkuNTA1OTcsMTEuMDYxOTgsMTYuNzIwMjksMTAuOTc3MDENCglDMjMyLjcyNTY2LDI0Mi4yMjQ4MiwyNDEuMjEzMTcsMjI4Ljc4NjI1LDIzNS43ODEyMiwyMTcuMDQ1MzN6Ii8+DQo8L3N2Zz4NCg==';
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: AvanaWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: AvanaWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.avana?.solana?.isAvana) {
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
            const wallet = window.avana!.solana!;

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
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const { signers, ...sendOptions } = options;

                transaction = await this.prepareTransaction(transaction, connection, sendOptions);

                signers?.length && transaction.partialSign(...signers);

                sendOptions.preflightCommitment = sendOptions.preflightCommitment || connection.commitment;

                const { signature } = await wallet.signAndSendTransaction(transaction, sendOptions);
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

    async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return ((await wallet.signTransaction(transaction)) as T) || transaction;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signAllTransactions<T extends Transaction>(transactions: T[]): Promise<T[]> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return ((await wallet.signAllTransactions(transactions)) as T[]) || transactions;
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
