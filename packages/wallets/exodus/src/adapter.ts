import {
    BaseMessageSignerWalletAdapter,
    EventEmitter,
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
    WalletWindowClosedError,
    scopePollingDetectionStrategy,
} from '@solana/wallet-adapter-base';
import { Connection, PublicKey, SendOptions, Transaction, TransactionSignature } from '@solana/web3.js';

interface ExodusWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface ExodusWallet extends EventEmitter<ExodusWalletEvents> {
    isExodus?: boolean;
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
    _handleDisconnect(...args: unknown[]): unknown;
}

interface ExodusWindow extends Window {
    solana?: ExodusWallet;
}

declare const window: ExodusWindow;

export interface ExodusWalletAdapterConfig {}

export const ExodusWalletName = 'Exodus' as WalletName<'Exodus'>;

export class ExodusWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = ExodusWalletName;
    url = 'https://exodus.com';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMzQiIHZpZXdCb3g9IjAgMCAyNjQgMjY0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCB4MT0iMCUiIHkxPSI1MCUiIHgyPSIxMDAlIiB5Mj0iNTAlIiBpZD0iZ3JhZGllbnQiPjxzdG9wIHN0b3AtY29sb3I9IiMwMEJGRkYiIG9mZnNldD0iMCUiPjwvc3RvcD48c3RvcCBzdG9wLWNvbG9yPSIjNjYxOUZGIiBvZmZzZXQ9IjEwMCUiPjwvc3RvcD48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48ZyBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTg1LjA2LDEzMiBMMjY0LDIxMC44NjAwMTYgTDIzNi4yLDIxMC44NiBDMjMxLjQyMzY1MiwyMTAuODY2NDA5IDIyNi44NDA1OTIsMjA4Ljk3NDE4NyAyMjMuNDYsMjA1LjYgTDE0OS44MiwxMzIgTDIyMy40Niw1OC4zNCBDMjI2Ljg0MDU5Miw1NC45NjU4MTI3IDIzMS40MjM2NTIsNTMuMDczNTkxNCAyMzYuMiw1My4wOCBMMjY0LDUzLjA3OTk4MzggTDE4NS4wNiwxMzIgWiBNNDAuNTIsNTguMzQgQzM3LjE0NDMxMSw1NC45NzA3MTQzIDMyLjU2OTQxOTMsNTMuMDc4ODk1OSAyNy44LDUzLjA4IEwwLDUzLjA3OTk5OTUgTDc4LjkyLDEzMiBMMCwyMTAuODYgTDI3LjgsMjEwLjg2IEMzMi41Njk0MTkzLDIxMC44NjExMDQgMzcuMTQ0MzExLDIwOC45NjkyODYgNDAuNTIsMjA1LjYgTDExNC4xOCwxMzIgTDQwLjUyLDU4LjM0IFogTTEzMiwxNDkuODIgTDU4LjM0LDIyMy40OCBDNTQuOTcwNzE0MywyMjYuODU1Njg5IDUzLjA3ODg5NTksMjMxLjQzMDU4MSA1My4wOCwyMzYuMiBMNTMuMDc5OTk5NSwyNjQgTDEzMiwxODUuMDggTDIxMC45MiwyNjQgTDIxMC45MiwyMzYuMiBDMjEwLjkxNTc5OSwyMzEuNDI3NzEyIDIwOS4wMTY2MiwyMjYuODUyNDE3IDIwNS42NCwyMjMuNDggTDEzMiwxNDkuODIgWiBNMTMyLDExNC4xOCBMMjA1LjY0LDQwLjUyIEMyMDkuMDE2NjIsMzcuMTQ3NTgzNCAyMTAuOTE1Nzk5LDMyLjU3MjI4ODQgMjEwLjkyLDI3LjggTDIxMC45MiwwIEwxMzIsNzguOTIgTDUzLjA3OTk5OTUsMCBMNTMuMDgsMjcuOCBDNTMuMDc4ODk1OSwzMi41Njk0MTkzIDU0Ljk3MDcxNDMsMzcuMTQ0MzExIDU4LjM0LDQwLjUyIEwxMzIsMTE0LjE4IFoiIGlkPSJFeG9kdXNfc3ltYm9sIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIgZmlsbC1ydWxlPSJub256ZXJvIj48L3BhdGg+PC9nPjwvc3ZnPgo=';

    private _connecting: boolean;
    private _wallet: ExodusWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: ExodusWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.solana?.isExodus) {
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
            const wallet = window!.solana!;

            if (!wallet.isConnected) {
                // HACK: Exodus doesn't reject or emit an event if the popup is closed
                const handleDisconnect = wallet._handleDisconnect;
                try {
                    await new Promise<void>((resolve, reject) => {
                        const connect = () => {
                            wallet.off('connect', connect);
                            resolve();
                        };

                        wallet._handleDisconnect = (...args: unknown[]) => {
                            wallet.off('connect', connect);
                            reject(new WalletWindowClosedError());
                            return handleDisconnect.apply(wallet, args);
                        };

                        wallet.on('connect', connect);

                        wallet.connect().catch((reason: any) => {
                            wallet.off('connect', connect);
                            reject(reason);
                        });
                    });
                } catch (error: any) {
                    if (error instanceof WalletError) throw error;
                    throw new WalletConnectionError(error?.message, error);
                } finally {
                    wallet._handleDisconnect = handleDisconnect;
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
            // Exodus doesn't handle partial signers, so if they are provided, don't use `signAndSendTransaction`
            if (wallet && 'signAndSendTransaction' in wallet && !options?.signers) {
                // HACK: Exodus's `signAndSendTransaction` should always set these, but doesn't yet
                transaction.feePayer = transaction.feePayer || this.publicKey || undefined;
                transaction.recentBlockhash =
                    transaction.recentBlockhash || (await connection.getRecentBlockhash('finalized')).blockhash;

                const { signature } = await wallet.signAndSendTransaction(transaction, options);
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
                return await wallet.signTransaction(transaction);
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
                return await wallet.signAllTransactions(transactions);
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
