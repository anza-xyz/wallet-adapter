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
        'data:image/png;base64,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';

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
