import {
    BaseSignerWalletAdapter,
    pollUntilReady,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectionError,
    WalletError,
    WalletNotConnectedError,
    WalletNotFoundError,
    WalletPublicKeyError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';

interface SlopeWallet {
    connect(): Promise<{
        msg: string;
        data: {
            publicKey?: string;
        };
    }>;
    disconnect(): Promise<{ msg: string }>;
    signTransaction(message: string): Promise<{
        msg: string;
        data: {
            publicKey?: string;
            signature?: string;
        };
    }>;
    signAllTransactions(messages: string[]): Promise<{
        msg: string;
        data: {
            publicKey?: string;
            signatures?: string[];
        };
    }>;
}

interface SlopeWindow extends Window {
    Slope?: {
        new (): SlopeWallet;
    };
}

declare const window: SlopeWindow;

export interface SlopeWalletAdapterConfig {
    pollInterval?: number;
    pollCount?: number;
}

export class SlopeWalletAdapter extends BaseSignerWalletAdapter {
    private _connecting: boolean;
    private _wallet: SlopeWallet | null;
    private _publicKey: PublicKey | null;

    constructor(config: SlopeWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (!this.ready) pollUntilReady(this, config.pollInterval || 1000, config.pollCount || 3);
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get ready(): boolean {
        return typeof window !== 'undefined' && !!window.Slope;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._publicKey;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            if (!window.Slope) throw new WalletNotFoundError();

            const wallet = new window.Slope();

            let account: string;
            try {
                const { data } = await wallet.connect();

                if (!data.publicKey) throw new WalletConnectionError();

                account = data.publicKey;
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletConnectionError(error?.message, error);
            }

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(account);
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            this._wallet = wallet;
            this._publicKey = publicKey;

            this.emit('connect');
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
            this._wallet = null;
            this._publicKey = null;

            try {
                const { msg } = await wallet.disconnect();
                if (msg !== 'ok') throw new WalletDisconnectionError(msg);
            } catch (error: any) {
                if (!(error instanceof WalletError)) {
                    // eslint-disable-next-line no-ex-assign
                    error = new WalletDisconnectionError(error?.message, error);
                }
                this.emit('error', error);
            }

            this.emit('disconnect');
        }
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const message = bs58.encode(transaction.serializeMessage());
                const { msg, data } = await wallet.signTransaction(message);

                if (!data.publicKey || !data.signature) throw new WalletSignTransactionError(msg);

                const publicKey = new PublicKey(data.publicKey);
                const signature = bs58.decode(data.signature);

                transaction.addSignature(publicKey, signature);
                return transaction;
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
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
                const messages = transactions.map((transaction) => bs58.encode(transaction.serializeMessage()));
                const { msg, data } = await wallet.signAllTransactions(messages);

                const length = transactions.length;
                if (!data.publicKey || data.signatures?.length !== length) throw new WalletSignTransactionError(msg);

                const publicKey = new PublicKey(data.publicKey);

                for (let i = 0; i < length; i++) {
                    transactions[i].addSignature(publicKey, bs58.decode(data.signatures[i]));
                }

                return transactions;
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
}
