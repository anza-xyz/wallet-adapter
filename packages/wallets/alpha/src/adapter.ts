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

interface AlphaWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface AlphaWallet extends EventEmitter<AlphaWalletEvents> {
    isAlpha?: boolean;
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

interface AlphaWindow extends Window {
    alpha?: AlphaWallet;
}

declare const window: AlphaWindow;

export interface AlphaWalletAdapterConfig {}

export const AlphaWalletName = 'Alpha' as WalletName<'Alpha'>;

export class AlphaWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = AlphaWalletName;
    url = 'https://github.com/babilu-online/alpha-wallet';
    icon =
        'data:image/svg+xml;base64,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';

    private _connecting: boolean;
    private _wallet: AlphaWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: AlphaWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.alpha?.isAlpha) {
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
            const wallet = window.alpha!;

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
