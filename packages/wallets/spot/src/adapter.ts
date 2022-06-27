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
            if (wallet && 'signAndSendTransaction' in wallet) {
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
