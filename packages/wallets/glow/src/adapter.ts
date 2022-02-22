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
import {
    Connection,
    PublicKey,
    SendOptions,
    Transaction,
    TransactionSignature,
} from '@solana/web3.js';

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
    solana?: GlowWallet;
}

declare const window: GlowWindow;

export interface GlowWalletAdapterConfig {}

export const GlowWalletName = 'Glow' as WalletName;

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
            scopePollingDetectionStrategy(() => {
                if (window.solana?.isGlow) {
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
            if (this.connected || this.connecting) {
                return;
            }
            if (this._readyState !== WalletReadyState.Installed) {
                throw new WalletNotReadyError();
            }

            this._connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const wallet = window!.solana!;

            try {
                await wallet.connect()
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
