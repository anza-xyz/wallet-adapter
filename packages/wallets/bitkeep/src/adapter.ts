import {
    pollUntilBreak,
    pollUntilReady,
    WalletAccountError,
    WalletDisconnectionError,
    WalletNotConnectedError,
    WalletNotFoundError,
    WalletNotInstalledError,
    WalletPublicKeyError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';
import { BaseChangerWalletAdapter } from '@solana/wallet-adapter-base/lib/changer';

interface BitKeepWallet {
    isBitKeep?: boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getAccount(): Promise<string>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}

interface BitKeepWindow extends Window {
    bitkeep?: {
        solana?: BitKeepWallet;
    };
}

declare const window: BitKeepWindow;

export interface BitKeepWalletAdapterConfig {
    pollInterval?: number;
    pollCount?: number;
}

export class BitKeepWalletAdapter extends BaseChangerWalletAdapter {
    private _connecting: boolean;
    private _wallet: BitKeepWallet | null;
    private _publicKey: PublicKey | null;
    private _canPollForChange: boolean;
    private _pollInterval: number;

    constructor(config: BitKeepWalletAdapterConfig = {}) {
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
        return typeof window !== 'undefined' && !!window.bitkeep;
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

            const wallet = typeof window !== 'undefined' && window.bitkeep?.solana;
            if (!wallet) throw new WalletNotFoundError();
            if (!wallet.isBitKeep) throw new WalletNotInstalledError();

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
        const wallet = this._wallet;
        if (wallet) {
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

    private async _getConnectedPublicKey(wallet: BitKeepWallet): Promise<PublicKey> {
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
