import {
    BaseSignerWalletAdapter,
    WalletAccountError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';

interface CloverWallet {
    isCloverWallet?: boolean;
    getAccount(): Promise<string>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}

interface CloverWalletWindow extends Window {
    clover_solana?: CloverWallet;
}

declare const window: CloverWalletWindow;

export interface CloverWalletAdapterConfig {}

export class CloverWalletAdapter extends BaseSignerWalletAdapter {
    private _connecting: boolean;
    private _wallet: CloverWallet | null;
    private _publicKey: PublicKey | null;

    constructor(config: CloverWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    async ready(): Promise<boolean> {
        if (typeof window === 'undefined' || typeof document === 'undefined') return false;

        if (document.readyState === 'complete') return !!window.clover_solana?.isCloverWallet;

        return new Promise((resolve) => {
            function listener() {
                window.removeEventListener('load', listener);
                resolve(!!window.clover_solana?.isCloverWallet);
            }

            window.addEventListener('load', listener);
        });
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            if (!(await this.ready())) throw new WalletNotReadyError();

            const wallet = window!.clover_solana!;

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
}
