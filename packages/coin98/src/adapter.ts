import {
    BaseSignerWalletAdapter,
    pollUntilReady,
    WalletAccountError,
    WalletNotConnectedError,
    WalletNotFoundError,
    WalletNotInstalledError,
    WalletPublicKeyError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';

interface Coin98Wallet {
    isCoin98?: boolean;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    isConnected(): boolean;
    connect(): Promise<string[]>;
    disconnect(): Promise<void>;
    request(params: { method: string; params: string | string[] | unknown }): Promise<{
        signature: string;
        publicKey: string;
    }>;
}

interface Coin98Window extends Window {
    coin98?: {
        sol?: Coin98Wallet;
    };
}

declare const window: Coin98Window;

export interface Coin98WalletAdapterConfig {
    pollInterval?: number;
    pollCount?: number;
}

export class Coin98WalletAdapter extends BaseSignerWalletAdapter {
    private _connecting: boolean;
    private _wallet: Coin98Wallet | null;
    private _publicKey: PublicKey | null;

    constructor(config: Coin98WalletAdapterConfig = {}) {
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
        return typeof window !== 'undefined' && !!window.coin98;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._wallet?.isConnected();
    }

    get autoApprove(): boolean {
        return false;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            const wallet = typeof window !== 'undefined' && window.coin98?.sol;
            if (!wallet) throw new WalletNotFoundError();
            if (!wallet.isCoin98) throw new WalletNotInstalledError();

            let account: string;
            try {
                [account] = await wallet.connect();
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
        if (this._wallet) {
            this._wallet.disconnect();
            this._wallet = null;
            this._publicKey = null;
            this.emit('disconnect');
        }
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const response = await wallet.request({ method: 'sol_sign', params: [transaction] });

                const publicKey = new PublicKey(response.publicKey);
                const signature = bs58.decode(response.signature);

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
                return await Promise.all(transactions.map((transaction) => this.signTransaction(transaction)));
            } catch (error) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
}
