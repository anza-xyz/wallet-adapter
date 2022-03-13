import {
    BaseMessageSignerWalletAdapter,
    EventEmitter,
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

interface GlowWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface GlowWallet extends EventEmitter<GlowWalletEvents> {
    isGlow?: boolean;
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

interface GlowWindow extends Window {
    glowSolana?: GlowWallet;
}

declare const window: GlowWindow;

export interface GlowWalletAdapterConfig {}

export const GlowWalletName = 'Glow' as WalletName;

export class GlowWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = GlowWalletName;
    url = 'https://glow.app';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEyIiBoZWlnaHQ9IjIxMiIgdmlld0JveD0iMCAwIDIxMiAyMTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTc5LjU3NiAxODAuNzk3QzE2MC41MjUgMTk5LjU0IDEzNC4zODkgMjExLjEwNCAxMDUuNTUyIDIxMS4xMDRDNzYuNzc4NyAyMTEuMTA0IDUwLjY5NDQgMTk5LjU5MSAzMS42NTQ0IDE4MC45MkM3NC44ODA2IDE0Ni44NzYgMTM2LjMwNSAxNDYuODM1IDE3OS41NzYgMTgwLjc5N1pNMTgwLjc5NiAxNzkuNTc3QzE5OS41NCAxNjAuNTI2IDIxMS4xMDQgMTM0LjM5IDIxMS4xMDQgMTA1LjU1MkMyMTEuMTA0IDc2Ljc4NjYgMTk5LjU5NyA1MC43MDg3IDE4MC45MzYgMzEuNjcwMUMxNDYuODc2IDc1LjAxMjkgMTQ2LjgzIDEzNi4zMjEgMTgwLjc5NiAxNzkuNTc3Wk0xNzkuNzM1IDMwLjQ2NDlDMTM2LjQwMyA2NC41OTQ1IDc0Ljc4MjMgNjQuNTUzMSAzMS40OTQ2IDMwLjM0MDhDNTAuNTQ4MyAxMS41Nzc2IDc2LjY5ODEgMCAxMDUuNTUyIDBDMTM0LjQ3IDAgMTYwLjY3MSAxMS42Mjg3IDE3OS43MzUgMzAuNDY0OVpNMzAuMzQwOCAzMS40OTQ2QzExLjU3NzYgNTAuNTQ4MyAwIDc2LjY5ODEgMCAxMDUuNTUyQzAgMTM0LjQ3IDExLjYyODcgMTYwLjY3MSAzMC40NjQ5IDE3OS43MzVDNjQuNTk0NSAxMzYuNDAzIDY0LjU1MzEgNzQuNzgyMyAzMC4zNDA4IDMxLjQ5NDZaIiBmaWxsPSJibGFjayIvPgo8L3N2Zz4K';

    private _connecting: boolean;
    private _wallet: GlowWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(_config: GlowWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
        if (this._readyState !== WalletReadyState.Unsupported) {
            const handler = (event: MessageEvent<any>) => {
                if (typeof event.data === 'object' && event.data.__glow_loaded) {
                    if (this._readyState !== WalletReadyState.Installed) {
                        this._readyState = WalletReadyState.Installed;
                        this.emit('readyStateChange', this._readyState);
                    }
                    window.removeEventListener('message', handler);
                }
            };

            window.addEventListener('message', handler);

            scopePollingDetectionStrategy(() => {
                if (window.glowSolana?.isGlow) {
                    if (this._readyState !== WalletReadyState.Installed) {
                        this._readyState = WalletReadyState.Installed;
                        this.emit('readyStateChange', this._readyState);
                    }
                    window.removeEventListener('message', handler);
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
            const wallet = window!.glowSolana!;

            try {
                await wallet.connect();
            } catch (error: any) {
                if (error instanceof WalletError) {
                    throw error;
                }
                throw new WalletConnectionError(error?.message, error);
            }

            if (!wallet.publicKey) {
                throw new WalletAccountError();
            }

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
            // Glow doesn't handle partial signers, so if they are provided, don't use `signAndSendTransaction`
            if (wallet && 'signAndSendTransaction' in wallet && !options?.signers) {
                // TODO: update glow to fix this
                // HACK: Glow's `signAndSendTransaction` should always set these, but doesn't yet
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
