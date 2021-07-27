import {
    EventEmitter,
    pollUntilReady,
    WalletAccountError,
    WalletAdapter,
    WalletAdapterEvents,
    WalletNotConnectedError,
    WalletNotFoundError,
    WalletNotInstalledError,
    WalletPublicKeyError,
    WalletSignatureError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';

interface MathWalletProvider {
    isMathWallet?: boolean;
    getAccount: () => Promise<string>;
    signTransaction: (transaction: Transaction) => Promise<Transaction>;
    signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
}

interface MathWalletWindow extends Window {
    solana?: MathWalletProvider;
}

declare const window: MathWalletWindow;

export interface MathWalletWalletAdapterConfig {
    pollInterval?: number;
    pollCount?: number;
}

export class MathWalletWalletAdapter extends EventEmitter<WalletAdapterEvents> implements WalletAdapter {
    private _publicKey: PublicKey | null;
    private _connecting: boolean;
    private _provider: MathWalletProvider | undefined;

    constructor(config: MathWalletWalletAdapterConfig = {}) {
        super();
        this._publicKey = null;
        this._connecting = false;

        if (!this.ready) pollUntilReady(this, config.pollInterval || 1000, config.pollCount || 3);
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get ready(): boolean {
        return !!window.solana?.isMathWallet;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._provider;
    }

    get autoApprove(): boolean {
        return false;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            const provider = window.solana;
            if (!provider) throw new WalletNotFoundError();
            if (!provider.isMathWallet) throw new WalletNotInstalledError();

            // @FIXME: handle popup issues
            let account: string;
            try {
                account = await provider.getAccount();
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
        // @FIXME: add logout
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
                return provider.signTransaction(transaction);
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
                return provider.signAllTransactions(transactions);
            } catch (error) {
                throw new WalletSignatureError(error?.message, error);
            }
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
}
