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

// This detects if it's possible to install Glow on this device.
// https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
export const isIOS = (): boolean => {
    return [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
    ].includes(navigator.platform);
}

export class GlowWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = GlowWalletName;
    url = 'https://glow.app';
    icon =
        'data:image/svg+xml;base64,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';

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
                    window.removeEventListener('message', handler);
                    if (this._readyState !== WalletReadyState.Installed) {
                        this._readyState = WalletReadyState.Installed;
                        this.emit('readyStateChange', this._readyState);
                    }
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
