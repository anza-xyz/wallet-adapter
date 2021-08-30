import {
    BaseSignerWalletAdapter,
    pollUntilReady,
    WalletAccountError,
    WalletNotConnectedError,
    WalletDisconnectionError,
    WalletNotFoundError,
    WalletNotInstalledError,
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
    disconnect(): Promise<{
        msg: string;
    }>;
    signTransaction(message: string): Promise<{
        msg: string;
        data: {
            publicKey?: string;
            signature?: string;
        }
    }>;
    signAllTransactions(messages: string[]): Promise<{
        msg: string;
        data: {
            publicKey?: string;
            signatures?: string[];
        }
    }>;
}

interface SlopeWindow extends Window {
    Slope?: any;
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

    get autoApprove(): boolean {
        return false;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            if (!window.Slope) throw new WalletNotFoundError();

            const wallet = this._wallet || new window.Slope();
            if (!wallet.connect) throw new WalletNotInstalledError()

            let account: string;
            try {
               const { msg, data } = await wallet.connect();

               if (!data.publicKey) throw new WalletAccountError(msg);

               account = data.publicKey;
            } catch (error) {
                throw new WalletAccountError(error?.message, error);
            }

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(account);
            } catch (error) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            this._wallet = wallet;
            this._publicKey = publicKey;

            this.emit('connect');
        } catch (error) {
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
                if (msg !== 'ok') this.emit('error', new WalletDisconnectionError(msg));
            } catch (error) {
                this.emit('error', new WalletDisconnectionError(error.message, error));
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
            } catch (error) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const messages = transactions.map(tx => bs58.encode(tx.serializeMessage()));
                const { msg, data } = await wallet.signAllTransactions(messages);

                if (!data.publicKey || !data.signatures?.length) throw new WalletSignTransactionError(msg);

                const publicKey = new PublicKey(data.publicKey);

                transactions.forEach((tx, idx) => {
                    // @ts-ignore
                    tx.addSignature(publicKey, bs58.decode(data.signatures[idx]))
                })
                return transactions;
            } catch (error) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
}
