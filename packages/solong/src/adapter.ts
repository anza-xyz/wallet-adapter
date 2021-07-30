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

interface SolongProvider {
    currentAccount?: string | null;
    selectAccount: () => Promise<string>;
    signTransaction: (transaction: Transaction) => Promise<Transaction>;
}

interface SolongWindow extends Window {
    solong?: SolongProvider;
}

declare const window: SolongWindow;

export interface SolongWalletAdapterConfig {
    pollInterval?: number;
    pollCount?: number;
}

export class SolongWalletAdapter extends EventEmitter<WalletAdapterEvents> implements WalletAdapter {
    private _publicKey: PublicKey | null;
    private _connecting: boolean;
    private _provider: SolongProvider | undefined;

    constructor(config: SolongWalletAdapterConfig = {}) {
        super();
        this._publicKey = null;
        this._connecting = false;

        if (!this.ready) pollUntilReady(this, config.pollInterval || 1000, config.pollCount || 3);
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get ready(): boolean {
        return !!window.solong;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._provider?.currentAccount;
    }

    get autoApprove(): boolean {
        return false;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            const provider = window.solong;
            if (!provider) throw new WalletNotFoundError();

            let account: string;
            try {
                account = await provider.selectAccount();
            } catch (error) {
                throw new WalletAccountError(error?.message, error);
            }

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(account);
            } catch (error) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            this._publicKey = publicKey;
            this._provider = provider;
            this.emit('connect');
        } catch (error) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        // @TODO: check if this should disconnect from the provider
        if (this._provider) {
            this._publicKey = null;
            this._provider = undefined;
            this.emit('disconnect');
        }
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            const provider = this._provider;
            if (!provider) throw new WalletNotConnectedError();

            try {
                return await provider.signTransaction(transaction);
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
            const provider = this._provider;
            if (!provider) throw new WalletNotConnectedError();

            try {
                return await Promise.all(transactions.map((transaction) => provider.signTransaction(transaction)));
            } catch (error) {
                throw new WalletSignatureError(error?.message, error);
            }
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
}
