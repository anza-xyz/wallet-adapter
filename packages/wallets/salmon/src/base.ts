import type Salmon from 'salmon-adapter-sdk';
import { SalmonWallet } from 'salmon-adapter-sdk';
import {
    BaseMessageSignerWalletAdapter,
    scopePollingDetectionStrategy,
    WalletAdapterNetwork,
    WalletConfigError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletLoadError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';

interface SalmonWindow extends Window {
    salmon?: SalmonWallet;
}

declare const window: SalmonWindow;

export interface SalmonWalletAdapterConfig {
    provider?: string | SalmonWallet;
    network?: WalletAdapterNetwork;
}

export abstract class BaseSalmonWalletAdapter extends BaseMessageSignerWalletAdapter {
    protected _provider: string | SalmonWallet | undefined;
    protected _network: WalletAdapterNetwork;
    protected _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;
    protected _connecting: boolean;
    protected _wallet: Salmon | null;

    constructor({ provider, network = WalletAdapterNetwork.Mainnet }: SalmonWalletAdapterConfig = {}) {
        super();

        this._provider = provider;
        this._network = network;
        this._connecting = false;
        this._wallet = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            if (typeof this._provider === 'string') {
                this._readyState = WalletReadyState.Loadable;
            } else {
                scopePollingDetectionStrategy(() => {
                    if (typeof window.salmon?.postMessage === 'function') {
                        this._readyState = WalletReadyState.Installed;
                        this.emit('readyStateChange', this._readyState);
                        return true;
                    }
                    return false;
                });
            }
        }
    }

    get publicKey(): PublicKey | null {
        return this._wallet?.publicKey || null;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._wallet?.connected;
    }

    get readyState(): WalletReadyState {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (!(this._readyState === WalletReadyState.Loadable || this._readyState === WalletReadyState.Installed))
                throw new WalletNotReadyError();

            this._connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const provider = this._provider || window!.salmon!;

            let SalmonClass: typeof Salmon;
            try {
                ({ default: SalmonClass } = await import('salmon-adapter-sdk'));
            } catch (error: any) {
                throw new WalletLoadError(error?.message, error);
            }

            let wallet: Salmon;
            try {
                wallet = new SalmonClass({ provider, network: this._network });
            } catch (error: any) {
                throw new WalletConfigError(error?.message, error);
            }

            if (!wallet.connected) {
                try {
                    await wallet.connect();
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
                }
            }

            if (!wallet.publicKey) throw new WalletPublicKeyError();

            wallet.on('disconnect', this._disconnected);

            this._wallet = wallet;

            this.emit('connect', wallet.publicKey);
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
            wallet.off('disconnect', this._disconnected);

            this._wallet = null;

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

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return await wallet.signMessage(message, 'utf8');
            } catch (error: any) {
                throw new WalletSignMessageError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    private _disconnected = () => {
        const wallet = this._wallet;
        if (wallet) {
            wallet.off('disconnect', this._disconnected);

            this._wallet = null;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };
}
