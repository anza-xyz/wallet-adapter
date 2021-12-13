import {
    BaseSignerWalletAdapter,
    WalletAccountError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';

interface CoinhubWallet {
    isCoinhubWallet?: boolean;
    getAccount(): Promise<string>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}

interface CoinhubWalletWindow extends Window {
    coinhub?: CoinhubWallet;
}

declare const window: CoinhubWalletWindow;

export interface CoinhubWalletAdapterConfig {}

export class CoinhubWalletAdapter extends BaseSignerWalletAdapter {
    private _connecting: boolean;
    private _wallet: CoinhubWallet | null;
    private _publicKey: PublicKey | null;

    constructor(config: CoinhubWalletAdapterConfig = {}) {
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

    get connected(): boolean {
        return !!this._wallet;
    }

    async ready(): Promise<boolean> {
        if (typeof window === 'undefined' || typeof document === 'undefined') return false;

        if (document.readyState === 'complete') return !!window.coinhub?.isCoinhubWallet;

        return new Promise((resolve) => {
            function listener() {
                window.removeEventListener('load', listener);
                resolve(!!window.coinhub?.isCoinhubWallet);
            }

            window.addEventListener('load', listener);
        });
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            if (!(await this.ready())) throw new WalletNotReadyError();

            const wallet = window!.coinhub!;

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
