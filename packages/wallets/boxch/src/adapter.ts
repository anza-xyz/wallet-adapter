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

interface BoxchWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
    accountChanged(newPublicKey: PublicKey): unknown;
}

interface BoxchWallet extends EventEmitter<BoxchWalletEvents> {
    isBoxch?: boolean;
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

interface BoxchWindow extends Window {
    boxch?: {
        solana?: BoxchWallet;
    };
    solana?: BoxchWallet;
}

declare const window: BoxchWindow;

export interface BoxchWalletAdapterConfig {}

export const BoxchWalletName = 'Boxch' as WalletName<'Boxch'>;

export class BoxchWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = BoxchWalletName;
    url = 'https://boxch.net';
    icon =
        'data:image/png;base64,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';
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: BoxchWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: BoxchWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.boxch?.solana?.isBoxch || window.solana?.isBoxch) {
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
            const wallet = window.boxch?.solana || window.solana!;

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
            wallet.off('accountChanged', this._accountChanged);

            this._wallet = null;
            this._publicKey = null;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };

    private _accountChanged = (newPublicKey: PublicKey) => {
        const publicKey = this._publicKey;
        if (!publicKey) return;

        try {
            newPublicKey = new PublicKey(newPublicKey.toBytes());
        } catch (error: any) {
            this.emit('error', new WalletPublicKeyError(error?.message, error));
            return;
        }

        if (publicKey.equals(newPublicKey)) return;

        this._publicKey = newPublicKey;
        this.emit('connect', newPublicKey);
    };
}
