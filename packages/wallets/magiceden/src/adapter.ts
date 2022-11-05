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

interface MagicEdenWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface MagicEdenWallet extends EventEmitter<MagicEdenWalletEvents> {
    isMagicEden?: boolean;
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

interface MagicEdenWindow extends Window {
    magicEden?: {
        solana?: MagicEdenWallet;
    };
}

declare const window: MagicEdenWindow;

export interface MagicEdenWalletAdapterConfig {}

export const MagicEdenWalletName = 'Magic Eden' as WalletName<'Magic Eden'>;

export class MagicEdenWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = MagicEdenWalletName;
    url = 'https://magiceden.io';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA2MCA3MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTM0LjE5NDkgMi4wMTE0QzMzLjU2MjkgMC4xMTUzNTYgMzEuMjY0NiAtMC42MDg1ODkgMjkuNjU1OSAwLjU3NTAwM0w4Ljc3NjM4IDE1LjkwNDJDOC43NzYzOCAxNS45MDQyIDcuNTIzODQgMTYuODY5NSA3LjE5MDU5IDE3LjE0NTNDMi4wNzcwMiAyMS4zMDUxIC0wLjk1NjY1NSAyNS45ODIgMC4yNzI5MDEgMjguMDM4OUMwLjcyMTA1NyAyOC43ODU5IDEuNjc0ODMgMjkuMDg0NiAyLjk3MzMzIDI5LjAwNDJDNC4wNzY0OCAyNi41MzM2IDYuODM0MzcgMjMuMzUwNSAxMC41NDYgMjAuNTEyMkMxMC43NDE0IDIwLjM2MjggMjkuNjQ0NCA2LjQ5Mjk2IDM0LjUwNTEgMi45MTkyTDM0LjE5NDkgMi4wMTE0WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzQxNV8zNjI3KSIvPgo8cGF0aCBkPSJNNTcuMTY1IDM2LjQxNThMNDQuNTAxNyA0NS43MTIyTDQ0LjQ5MDIgNDUuNzAwN0M0Mi4wMDgxIDQ3LjQzNTkgMzguODEzNiA0Ni44MDM5IDM3LjI5NjggNDQuMjUyOEMzNS43Nzk5IDQxLjcwMTggMzYuNTAzOSAzOC4xOTcgMzguOTE3IDM2LjMzNTRMMzguOTA1NSAzNi4zMjM5TDUzLjEwODYgMjUuOTAxNEM1NC4zMTUyIDI1LjAxNjYgNTQuOTEyNyAyMy41MzQyIDU0LjY0ODQgMjIuMDYzNEw1MS40MTk0IDMuNDkzNjJDNTEuMTA5MiAxLjczNTQ3IDQ5LjA2MzcgMC45MDgxMDEgNDcuNjI3MyAxLjk2NTI5TDI5LjA2OTEgMTUuNTkzOEwxNC44MiAyNi4wNTA4QzguNzc1NjQgMzAuNDg2NCAyLjgwMDIzIDMyLjMwMiAxLjQ5MDIzIDMwLjA4NDJMMjIuOTQ0MyA2Ni4wODYxQzI0Ljg1MTggNjguNjI1NiAyNy41ODY3IDcwLjQ1MjcgMzAuODYxNyA3MS4wNjE4QzM0LjI4NjEgNzEuNzA1MyAzNy42OTg5IDcwLjkxMjQgNDAuNTgzMiA2OS4wOTY4TDU4LjQ2MzUgNTUuOTczOEM1OS42MTI2IDU1LjEyMzUgNjAuMTg3MiA1My42OTg2IDU5Ljk0NTkgNTIuMjg1Mkw1Ny4xNjUgMzYuNDE1OFoiIGZpbGw9InVybCgjcGFpbnQxX2xpbmVhcl80MTVfMzYyNykiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl80MTVfMzYyNyIgeDE9Ii0wLjAwMjg4NzE0IiB5MT0iMTQuNTEwOSIgeDI9IjM0LjUwMSIgeTI9IjE0LjUxMDkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzlBMDhCRSIvPgo8c3RvcCBvZmZzZXQ9IjAuMjkxNjY3IiBzdG9wLWNvbG9yPSIjQjExNEFFIi8+CjxzdG9wIG9mZnNldD0iMC41MjYwNDIiIHN0b3AtY29sb3I9IiNFMzI2OTMiLz4KPHN0b3Agb2Zmc2V0PSIwLjc1NTIwOCIgc3RvcC1jb2xvcj0iI0Y3MkQ4OCIvPgo8c3RvcCBvZmZzZXQ9IjAuOTUzMTI1IiBzdG9wLWNvbG9yPSIjRkY0QjlDIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQxX2xpbmVhcl80MTVfMzYyNyIgeDE9IjEzLjI4MjUiIHkxPSI1Mi44MjA3IiB4Mj0iNTkuNDQxOSIgeTI9IjI2LjIzNTgiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzlGMDBCNSIvPgo8c3RvcCBvZmZzZXQ9IjAuMDUzMzI4IiBzdG9wLWNvbG9yPSIjOEUwMEE1Ii8+CjxzdG9wIG9mZnNldD0iMC4wOTcxNTE0IiBzdG9wLWNvbG9yPSIjODUwMDlEIi8+CjxzdG9wIG9mZnNldD0iMC4yNjk2NzMiIHN0b3AtY29sb3I9IiNDODFDQTIiLz4KPHN0b3Agb2Zmc2V0PSIwLjYyNSIgc3RvcC1jb2xvcj0iI0ZDNDA5NSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGRjNCOTMiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K';
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: MagicEdenWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: MagicEdenWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.magicEden?.solana?.isMagicEden) {
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
            const wallet = window.magicEden!.solana!;

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
