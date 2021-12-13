import {
    BaseMessageSignerWalletAdapter,
    EventEmitter,
    WalletAccountError,
    WalletConnectionError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';

interface TokenPocketWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface TokenPocketWallet extends EventEmitter<TokenPocketWalletEvents> {
    isTokenPocket?: boolean;
    publicKey?: { toBytes(): Uint8Array };
    isConnected: boolean;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

interface TokenPocketWindow extends Window {
    solana?: TokenPocketWallet;
}

declare const window: TokenPocketWindow;

export interface TokenPocketWalletAdapterConfig {}

export class TokenPocketWalletAdapter extends BaseMessageSignerWalletAdapter {
    private _connecting: boolean;
    private _wallet: TokenPocketWallet | null;
    private _publicKey: PublicKey | null;

    constructor(config: TokenPocketWalletAdapterConfig = {}) {
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
        // @TODO: detect disconnection?
        return !!this._wallet?.isConnected;
    }

    async ready(): Promise<boolean> {
        if (typeof window === 'undefined' || typeof document === 'undefined') return false;

        if (document.readyState === 'complete') return !!window.solana?.isTokenPocket;

        return new Promise((resolve) => {
            function listener() {
                window.removeEventListener('load', listener);
                resolve(!!window.solana?.isTokenPocket);
            }

            window.addEventListener('load', listener);
        });
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            if (!(await this.ready())) throw new WalletNotReadyError();

            const wallet = window!.solana!;

            try {
                await wallet.connect();
            } catch (error: any) {
                throw new WalletConnectionError(error?.message, error);
            }

            if (!wallet.publicKey) throw new WalletAccountError();

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(wallet.publicKey.toBytes());
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
        const wallet = this._wallet;
        if (wallet) {
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

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const { signature } = await wallet.signMessage(message);
                return signature;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
}
