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
    WalletPublicKeyError,
    WalletSignTransactionError,
    WalletWindowClosedError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction, Message, Cluster } from '@solana/web3.js';
import Torus, { TorusParams } from '@toruslabs/solana-embed';

export interface TorusWalletAdapterConfig {
    torusParams?: TorusParams;
    // network?: WalletAdapterNetwork;
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
    private _config: TorusParams;

    constructor(config: TorusWalletAdapterConfig) {
        super();
        this._connecting = false;
        this._torus = null;
        this._publicKey = null;
        this._config = config.torusParams || {};
        // if (!this.ready) pollUntilReady(this, config.pollInterval || 1000, config.pollCount || 3);
        // this.ready = true;
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get ready(): boolean {
        return true
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
            let torus = typeof window !== 'undefined' && window.torus;
            if (!torus) torus = new Torus();
            window.torus = torus;
            if (!torus.isInitialized) await torus.init(this._config);

            // Login
            let loginResult;
            try {
                loginResult = await torus.login();
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletConnectionError(error?.message, error);
            }
            if (!loginResult) throw new WalletConnectionError();

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
        // torus.logout
        const wallet = this._torus;
        if (wallet) {
            window.torus = null
            this._torus = null;
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
            const wallet = this._torus;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const signature = await wallet.signMessage(message);
                return Uint8Array.from(signature);
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
