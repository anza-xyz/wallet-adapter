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

interface SafePalWallet {
    isSafePalWallet?: boolean;
    getAccount(): Promise<string>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}

interface SafePalWalletWindow extends Window {
    safepal?: SafePalWallet;
}

declare const window: SafePalWalletWindow;

export interface SafePalWalletAdapterConfig {
    pollInterval?: number;
    pollCount?: number;
}

export class SafePalWalletAdapter extends BaseSignerWalletAdapter {
    private _connecting: boolean;
    private _wallet: SafePalWallet | null;
    private _publicKey: PublicKey | null;

    constructor(config: SafePalWalletAdapterConfig = {}) {
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
        return typeof window !== 'undefined' && !!window.safepal?.isSafePalWallet;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._wallet;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            const wallet = window.safepal;
            if (!wallet) throw new WalletNotFoundError();
            if (!wallet.isSafePalWallet) throw new WalletNotInstalledError();

            let account: string;
            try {
                account = await wallet.getAccount();
            } catch (error: any) {
                throw new WalletAccountError(error?.message, error);
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
        if (this._wallet) {
            this._wallet = null;
            this._publicKey = null;
        }

        this.emit('disconnect');
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return wallet.signTransaction(transaction);
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
                return wallet.signAllTransactions(transactions);
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
}
