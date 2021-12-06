import {
    BaseMessageSignerWalletAdapter,
    BaseSignerWalletAdapter,
    EventEmitter,
    pollUntilReady,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletError,
    WalletNotConnectedError,
    WalletNotFoundError,
    WalletNotInstalledError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletSignTransactionError,
    WalletWindowClosedError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction, Message, Cluster } from '@solana/web3.js';
import Torus, { TorusParams } from '@toruslabs/solana-embed';

export interface TorusWalletAdapterConfig {
    params?: TorusParams;
    pollInterval?: number;
    pollCount?: number;
}
interface TorusWindow extends Window {
    torus: Torus | null;
}

declare const window: TorusWindow;

export class TorusWalletAdapter extends BaseSignerWalletAdapter {
    private _connecting: boolean;
    private _torus: Torus | null;
    private _publicKey: PublicKey | null;
    private _params: TorusParams;

    constructor(config: TorusWalletAdapterConfig) {
        super();
        this._connecting = false;
        this._torus = null;
        this._publicKey = null;
        this._params = config.params || {};
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get ready(): boolean {
        return typeof window !== 'undefined';
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._torus?.isLoggedIn;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            // Check if torus is initialized, torus.init({config})
            if (typeof window === 'undefined') throw new WalletNotReadyError();
            let torus = window.torus;
            if (!torus) torus = new Torus();
            window.torus = torus;
            if (!torus.isInitialized) await torus.init(this._params);

            // Login
            let loginResult;
            try {
                loginResult = await torus.login();
            } catch (error: any) {
                throw new WalletConnectionError(error?.message, error);
            }

            // Get public key
            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(loginResult[0]);
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            this._torus = torus;
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
        const torus = this._torus;
        if (torus) {
            this._torus = null;
            this._publicKey = null;
            try {
                if (torus.isLoggedIn) await torus.cleanUp();
            } catch (error: any) {
                this.emit('error', new WalletDisconnectionError(error?.message, error));
            }
        }
        this.emit('disconnect');
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            const wallet = this._torus;
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
            const wallet = this._torus;
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
            const torus = this._torus;
            if (!torus) throw new WalletNotConnectedError();

            try {
                return (await torus.signMessage(message))
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    private _disconnected = () => {
        this.disconnect();
    };
}
