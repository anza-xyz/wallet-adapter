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
    SendOptions,
    Transaction,
    TransactionSignature,
    TransactionVersion,
    VersionedTransaction,
} from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

interface BinanceWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
    accountChanged(newPublicKey: PublicKey | string | string[]): unknown;
}

interface BinanceWallet extends EventEmitter<BinanceWalletEvents> {
    publicKey?: { toBytes(): Uint8Array };
    isConnected: boolean;
    signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
    signAndSendTransaction<T extends Transaction | VersionedTransaction>(
        transaction: T,
        options?: SendOptions
    ): Promise<{ signature: TransactionSignature }>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

interface BinanceWindow extends Window {
    binancew3w?: {
        isExtension?: boolean;
        solana?: BinanceWallet;
    };
}

declare const window: BinanceWindow;

export interface BinanceWalletAdapterConfig {}

export const BinanceWalletName = 'Binance Wallet' as WalletName<'Binance Wallet'>;

export class BinanceWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = BinanceWalletName;
    url = 'https://chromewebstore.google.com/detail/cadiboklkpojfamcoggejbbdjcoiljjk?utm_source=anzasolanadownload';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOSIgdmlld0JveD0iMCAwIDE4IDE5IiBmaWxsPSJub25lIj48cGF0aCBkPSJNMCA5LjYxMTMzTDIuMDMyMjYgNy41NzkwN0w0LjA2NDUyIDkuNjExMzNMMi4wMzIyNiAxMS42NDM2TDAgOS42MTEzM1oiIGZpbGw9IiNGMEI5MEIiLz48cGF0aCBkPSJNMy40ODM4NyA2LjEyNzQ2TDkgMC42MTEzMjhMMTQuNTE2MSA2LjEyNzQ2TDEyLjQ4MzkgOC4xNTk3Mkw5IDQuNjc1ODRMNS41MTYxMyA4LjE1OTcyTDMuNDgzODcgNi4xMjc0NloiIGZpbGw9IiNGMEI5MEIiLz48cGF0aCBkPSJNNi45Njc3NCA5LjYxMTMzTDkgNy41NzkwN0wxMS4wMzIzIDkuNjExMzNMOSAxMS42NDM2TDYuOTY3NzQgOS42MTEzM1oiIGZpbGw9IiNGMEI5MEIiLz48cGF0aCBkPSJNNS41MTYxMyAxMS4wNjI5TDMuNDgzODcgMTMuMDk1Mkw5IDE4LjYxMTNMMTQuNTE2MSAxMy4wOTUyTDEyLjQ4MzkgMTEuMDYyOUw5IDE0LjU0NjhMNS41MTYxMyAxMS4wNjI5WiIgZmlsbD0iI0YwQjkwQiIvPjxwYXRoIGQ9Ik0xMy45MzU1IDkuNjExMzNMMTUuOTY3NyA3LjU3OTA3TDE4IDkuNjExMzNMMTUuOTY3NyAxMS42NDM2TDEzLjkzNTUgOS42MTEzM1oiIGZpbGw9IiNGMEI5MEIiLz48L3N2Zz4K';
    readonly supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0]);

    private _connecting: boolean;
    private _wallet: BinanceWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: BinanceWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.binancew3w?.isExtension && window.binancew3w?.solana) {
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
            const wallet = window.binancew3w!.solana!;

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
            wallet.on('accountChanged', this._accountChanged);

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
            wallet.off('accountChanged', this._accountChanged);

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
            wallet.off('accountChanged', this._accountChanged);

            this._wallet = null;
            this._publicKey = null;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };

    private _accountChanged = (newPublicKey: PublicKey | string | string[]) => {
        const publicKey = this._publicKey;
        if (!publicKey) return;

        try {
            let newPubKey: PublicKey;
            if (Array.isArray(newPublicKey)) {
                if (newPublicKey.length === 0) return;
                newPubKey = new PublicKey(newPublicKey[0]);
            } else if (typeof newPublicKey === 'string') {
                newPubKey = new PublicKey(newPublicKey);
            } else {
                newPubKey = new PublicKey(newPublicKey.toBytes());
            }

            if (publicKey.equals(newPubKey)) return;

            this._publicKey = newPubKey;
            this.emit('connect', newPubKey);
        } catch (error: any) {
            this.emit('error', new WalletPublicKeyError(error?.message, error));
        }
    };
}
