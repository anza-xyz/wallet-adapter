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
    WalletWindowClosedError,
} from '@solana/wallet-adapter-base';
import { Connection, PublicKey, SendOptions, Transaction, TransactionSignature } from '@solana/web3.js';

interface SpotWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface SpotWallet extends EventEmitter<SpotWalletEvents> {
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

interface SpotWindow extends Window {
    spotSolWallet?: SpotWallet;
}

declare const window: SpotWindow;

export interface SpotWalletAdapterConfig {}

export const SpotWalletName = 'Spot' as WalletName;

export class SpotWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = SpotWalletName;
    url = 'https://spot-wallet.com';
    icon =
        'data:image/png;base64,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';

    private _connecting: boolean;
    private _wallet: SpotWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: SpotWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (typeof window.spotSolWallet?.connect === 'function') {
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
            const wallet = window!.spotSolWallet!;

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
            // Spot doesn't handle partial signers, so if they are provided, don't use `signAndSendTransaction`
            if (wallet && 'signAndSendTransaction' in wallet && !options?.signers) {
                // HACK: Spot's `signAndSendTransaction` should always set these, but doesn't yet
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
