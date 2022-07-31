import type { EventEmitter, SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
import {
    BaseSignerWalletAdapter,
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
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type { Connection, SendOptions, Transaction, TransactionSignature } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

interface PhantomLedgerWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface PhantomLedgerWallet extends EventEmitter<PhantomLedgerWalletEvents> {
    isPhantom?: boolean;
    publicKey?: { toBytes(): Uint8Array };
    isConnected: boolean;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signAndSendTransaction(
        transaction: Transaction,
        options?: SendOptions
    ): Promise<{ signature: TransactionSignature }>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    _handleDisconnect(...args: unknown[]): unknown;
}

interface PhantomWindow extends Window {
    phantom?: {
        solana?: PhantomLedgerWallet;
    };
}

declare const window: PhantomWindow;

export interface PhantomLedgerWalletAdapterConfig {}

export const PhantomLedgerWalletName = 'Phantom Ledger' as WalletName<'Phantom Ledger'>;

export class PhantomLedgerWalletAdapter extends BaseSignerWalletAdapter {
    name = PhantomLedgerWalletName;
    url = 'https://help.phantom.app/hc/en-us/articles/4406388670483-How-to-use-your-Ledger-Nano-hardware-wallet';
    icon =
        'data:image/png;base64,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';

    private _connecting: boolean;
    private _wallet: PhantomLedgerWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: PhantomLedgerWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.phantom?.solana?.isPhantom) {
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
            const wallet = window!.phantom!.solana!;

            if (!wallet.isConnected) {
                try {
                    return await wallet.connect();
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
                transaction = await this.prepareTransaction(transaction, connection);

                const { signers, ...sendOptions } = options;
                signers?.length && transaction.partialSign(...signers);

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
