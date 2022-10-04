import {
    BaseSignerWalletAdapter,
    WalletConfigError,
    WalletConnectionError,
    WalletDisconnectionError,
    WalletLoadError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletReadyState,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type { WalletName } from '@solana/wallet-adapter-base';
import type { Transaction } from '@solana/web3.js';
import type { PublicKey } from '@solana/web3.js';
import type { FractalWalletAdapterImpl as FractalWallet } from '@fractalwagmi/solana-wallet-adapter';

export const FractalWalletName = 'Fractal' as WalletName<'Fractal'>;

export class FractalWalletAdapter extends BaseSignerWalletAdapter {
    name = FractalWalletName;
    url = 'https://developers.fractal.is/wallet-adapters/solana';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDEwMDAiPjxwYXRoIGQ9Ik0zNDIuMjQgNzYzLjkzVjI0My44Mkg3MTV2MTEyLjY5SDQ4MXYxMTUuNThoMTgydjExMi42OUg0ODF2MTc5LjE1WiIgc3R5bGU9ImZpbGw6I2RlMzU5YyIvPjwvc3ZnPg==';

    readonly supportedTransactionVersions = null;

    private readonly _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.Loadable;

    private _connecting: boolean;
    private _wallet: FractalWallet | null;
    private _publicKey: PublicKey | null;

    constructor() {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
    }

    get publicKey() {
        return this._wallet?.getPublicKey() ?? null;
    }

    get connecting() {
        return this._connecting;
    }

    get connected() {
        return !!this.publicKey;
    }

    get readyState() {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Loadable) throw new WalletNotReadyError();

            this._connecting = true;

            let FractalWalletClass: typeof FractalWallet;
            try {
                FractalWalletClass = (await import('@fractalwagmi/solana-wallet-adapter')).FractalWalletAdapterImpl;
            } catch (error: any) {
                throw new WalletLoadError(error?.message, error);
            }

            let wallet: FractalWallet;
            try {
                wallet = new FractalWalletClass();
            } catch (error: any) {
                throw new WalletConfigError(error?.message, error);
            }

            if (!wallet.getPublicKey()) {
                try {
                    await wallet.connect();
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
                }
            }

            this._wallet = wallet;
            this._publicKey = wallet.getPublicKey();
            if (!this._publicKey) {
                throw new WalletConnectionError('Expected a public key');
            }

            this.emit('connect', this._publicKey);
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

    async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return wallet.signTransaction(transaction);
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signAllTransactions<T extends Transaction>(transactions: T[]): Promise<T[]> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return wallet.signAllTransactions(transactions);
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
}
