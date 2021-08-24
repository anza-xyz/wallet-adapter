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
    WalletNotInstalledError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';

interface SignTransactionResponse {
    signature: string;
    publicKey: string;
}

interface RequestParams {
    method: string;
    params: string | string[] | unknown;
}

interface Coin98SolProvider {
    isCoin98?: boolean;
    signTransaction: (transaction: Transaction) => Promise<Transaction>;
    isConnected: () => boolean;
    connect: () => Promise<string[]>;
    disconnect: () => Promise<void>;
    request: (params: RequestParams) => Promise<SignTransactionResponse>;
}

interface Coin98Wallet {
    sol?: Coin98SolProvider;
}

interface Coin98Window extends Window {
    coin98?: Coin98Wallet;
}

declare const window: Coin98Window;

export interface Coin98WalletAdapterConfig {
    pollInterval?: number;
    pollCount?: number;
}

export class Coin98WalletAdapter extends EventEmitter<WalletAdapterEvents> implements WalletAdapter {
    private _connecting: boolean;
    private _wallet: Coin98SolProvider | null;
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
        return !!window.coin98;
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

            const wallet = window.coin98?.sol;
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
                const signedTransaction = await wallet.request({ method: 'sol_sign', params: [transaction] });
                const sig = bs58.decode(signedTransaction.signature);
                const publicKey = new PublicKey(signedTransaction.publicKey);
                transaction.addSignature(publicKey, sig);
                return transaction;
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
                return await Promise.all(transactions.map((transaction) => this.signTransaction(transaction)));
            } catch (error) {
                throw new WalletSignatureError(error?.message, error);
            }
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
}
