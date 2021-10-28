import {
    BaseSignerWalletAdapter, pollUntilBreak,
    pollUntilReady,
    WalletAccountError,
    WalletNotConnectedError,
    WalletNotFoundError,
    WalletNotInstalledError,
    WalletPublicKeyError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';
import { BaseChangerWalletAdapter } from '@solana/wallet-adapter-base/lib/changer';

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

export interface CloverWalletAdapterConfig {
    pollInterval?: number;
    pollCount?: number;
}

export class CloverWalletAdapter extends BaseChangerWalletAdapter {
    private _connecting: boolean;
    private _wallet: CloverWallet | null;
    private _publicKey: PublicKey | null;
    private _canPollForChange: boolean;
    private _pollInterval: number;

    constructor(config: CloverWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
        this._canPollForChange = false;
        this._pollInterval = config.pollInterval ? config.pollInterval : 1000;

        if (!this.ready) pollUntilReady(this, this._pollInterval, config.pollCount || 3);
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get ready(): boolean {
        return typeof window !== 'undefined' && !!window.clover_solana?.isCloverWallet;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._publicKey;
    }

    get canPollForChange(): boolean {
        return this._canPollForChange;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            const wallet = typeof window !== 'undefined' && window.clover_solana;
            if (!wallet) throw new WalletNotFoundError();
            if (!wallet.isCloverWallet) throw new WalletNotInstalledError();

            const publicKey = await this._getConnectedPublicKey(wallet);

            this._wallet = wallet;
            this._publicKey = publicKey;
            this._canPollForChange = true;
            pollUntilBreak(this, this.checkForChange, this._pollInterval);

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

    private async _getConnectedPublicKey(wallet: CloverWallet): Promise<PublicKey> {
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
        return publicKey;
    }

    async change(): Promise<void> {
        const wallet = this._wallet;

        if (wallet) {
            const publicKey = await this._getConnectedPublicKey(wallet);

            if (this._publicKey?.toBase58() !== publicKey.toBase58()) {
                this._wallet = wallet;
                this._publicKey = publicKey;
                this.emit('change');
            }
        }
    }
}
