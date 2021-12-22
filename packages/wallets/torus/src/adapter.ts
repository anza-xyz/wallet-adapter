import {
    BaseMessageSignerWalletAdapter,
    WalletAccountError,
    WalletConfigError,
    WalletConnectionError,
    WalletDisconnectionError,
    WalletLoadError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';
import type { default as Torus, TorusParams } from '@toruslabs/solana-embed';

export interface TorusWalletAdapterConfig {
    params?: TorusParams;
}

interface TorusWindow extends Window {
    torus?: Torus | null;
}

declare const window: TorusWindow;

export class TorusWalletAdapter extends BaseMessageSignerWalletAdapter {
    private _connecting: boolean;
    private _wallet: Torus | null;
    private _publicKey: PublicKey | null;
    private _params: TorusParams;
    private _readyState: WalletReadyState =
        typeof window !== 'undefined' ? WalletReadyState.Unsupported : WalletReadyState.Loadable;

    constructor(config: TorusWalletAdapterConfig) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
        this._params = config.params || {};
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._wallet?.isLoggedIn;
    }

    get readyState(): WalletReadyState {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Loadable) throw new WalletNotReadyError();

            this._connecting = true;

            let TorusEmbed: typeof import('@toruslabs/solana-embed');
            try {
                TorusEmbed = await import('@toruslabs/solana-embed');
            } catch (error: any) {
                throw new WalletLoadError(error?.message, error);
            }

            let wallet: Torus;
            try {
                wallet = window.torus || new TorusEmbed.default();
            } catch (error: any) {
                throw new WalletConfigError(error?.message, error);
            }

            if (!wallet.isInitialized) {
                try {
                    await wallet.init(this._params);
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
                }
            }

            let accounts: string[];
            try {
                accounts = await wallet.login();
            } catch (error: any) {
                throw new WalletAccountError(error?.message, error);
            }

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(accounts[0]);
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

            try {
                if (wallet.isLoggedIn) await wallet.cleanUp();
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

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return await wallet.signMessage(message);
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
}
