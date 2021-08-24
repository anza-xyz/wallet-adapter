import {
    EventEmitter,
    pollUntilReady,
    WalletAccountError,
    WalletAdapter,
    WalletAdapterEvents,
    WalletNotConnectedError,
    WalletNotFoundError,
    WalletPublicKeyError,
    WalletSignatureError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';

interface BitpieWallet {
    isBitpieWallet?: boolean;
    getAccount: () => Promise<string>;
    signTransaction: (transaction: Transaction) => Promise<Transaction>;
    signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
}

interface BitpieWalletWindow extends Window {
    bitpie?: BitpieWallet;
}

declare const window: BitpieWalletWindow;

export interface BitpieWalletWalletAdapterConfig {
    pollInterval?: number;
    pollCount?: number;
}

export class BitpieWalletWalletAdapter extends EventEmitter<WalletAdapterEvents> implements WalletAdapter {
    private _connecting: boolean;
    private _wallet: BitpieWallet | null;
    private _publicKey: PublicKey | null;

    constructor(config: BitpieWalletWalletAdapterConfig = {}) {
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
        return !!window.bitpie
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._wallet;
    }

    get autoApprove(): boolean {
        return false;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            const wallet = window.bitpie;
            if (!wallet) throw new WalletNotFoundError();

            let account: string;
            try {
                account = await wallet.getAccount();
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
                return wallet.signTransaction(transaction);
            } catch (error) {
                throw new WalletSignatureError(error?.message, error);
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
                return wallet.signAllTransactions(transactions);
            } catch (error) {
                throw new WalletSignatureError(error?.message, error);
            }
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
}
