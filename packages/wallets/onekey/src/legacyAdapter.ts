import type Wallet from '@project-serum/sol-wallet-adapter';
import {
    BaseMessageSignerWalletAdapter,
    WalletAdapterNetwork, WalletConfigError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletError, WalletLoadError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletSignMessageError,
    WalletSignTransactionError,
    WalletTimeoutError,
    WalletWindowBlockedError,
    WalletWindowClosedError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';
import utils from './utils';

export interface LegacyOneKeyWallet {
    isOneKey?: boolean;

    postMessage(...args: unknown[]): unknown;
}

export interface LegacyOneKeyWalletAdapterConfig {
    pollInterval?: number;
    pollCount?: number;
    provider?: string | LegacyOneKeyWallet;
    network?: WalletAdapterNetwork;
}

export class LegacyOneKeyWalletAdapter extends BaseMessageSignerWalletAdapter {
    private _provider: string | LegacyOneKeyWallet | null;
    private _network: WalletAdapterNetwork;
    private _connecting: boolean;
    private _wallet: Wallet | null;
    private _publicKey: PublicKey | null;


    constructor(config: LegacyOneKeyWalletAdapterConfig = {}) {
        super();
        this._provider = config.provider || utils.getLegacyProvider();
        this._network = config.network || WalletAdapterNetwork.Mainnet;
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
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

    async ready(): Promise<boolean> {
        if (typeof window === 'undefined' || typeof document === 'undefined') return false;

        if (typeof this._provider === 'string' || Boolean(utils.getLegacyProvider())) return true;

        if (document.readyState === 'complete') return Boolean(utils.getLegacyProvider());

        return new Promise((resolve) => {
            function listener() {
                window.removeEventListener('load', listener);
                resolve(Boolean(utils.getLegacyProvider()));
            }

            window.addEventListener('load', listener);
        });
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            if (!(await this.ready())) throw new WalletNotReadyError();

            const provider = this._provider || utils.getLegacyProvider();

            let SolWalletAdapter: typeof import('@project-serum/sol-wallet-adapter');
            try {
                SolWalletAdapter = await import('@project-serum/sol-wallet-adapter');
            } catch (error: any) {
                throw new WalletLoadError(error?.message, error);
            }

            let wallet: Wallet;
            try {
                wallet = new SolWalletAdapter.default(provider, this._network);
            } catch (error: any) {
                throw new WalletConfigError(error?.message, error);
            }

            try {
                const handleDisconnect: (...args: unknown[]) => unknown = (wallet as any).handleDisconnect;
                let timeout: NodeJS.Timer | undefined;
                let interval: NodeJS.Timer | undefined;
                try {
                    await new Promise<void>((resolve, reject) => {
                        const connect = () => {
                            if (timeout) clearTimeout(timeout);
                            wallet.off('connect', connect);
                            resolve();
                        };

                        (wallet as any).handleDisconnect = (...args: unknown[]): unknown => {
                            wallet.off('connect', connect);
                            reject(new WalletWindowClosedError());
                            return handleDisconnect.apply(wallet, args);
                        };

                        wallet.on('connect', connect);

                        wallet.connect().catch((reason: any) => {
                            wallet.off('connect', connect);
                            reject(reason);
                        });

                        if (typeof provider === 'string') {
                            let count = 0;

                            interval = setInterval(() => {
                                const popup = (wallet as any)._popup;
                                if (popup) {
                                    if (popup.closed) reject(new WalletWindowClosedError());
                                } else {
                                    if (count > 50) reject(new WalletWindowBlockedError());
                                }

                                count++;
                            }, 100);
                        } else {
                            timeout = setTimeout(() => reject(new WalletTimeoutError()), 10000);
                        }
                    });
                } finally {
                    (wallet as any).handleDisconnect = handleDisconnect;
                    if (interval) clearInterval(interval);
                }
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletConnectionError(error?.message, error);
            }

            wallet.on('disconnect', this._disconnected);

            this._wallet = wallet;

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
            wallet.off('disconnect', this._disconnected);

            this._wallet = null;

            const handleDisconnect: (...args: unknown[]) => unknown = (wallet as any).handleDisconnect;
            try {
                await new Promise<void>((resolve, reject) => {
                    const timeout = setTimeout(() => resolve(), 250);

                    (wallet as any).handleDisconnect = (...args: unknown[]): unknown => {
                        clearTimeout(timeout);
                        resolve();
                        (wallet as any)._responsePromises = new Map();
                        return handleDisconnect.apply(wallet, args);
                    };

                    wallet.disconnect().then(
                        () => {
                            clearTimeout(timeout);
                            resolve();
                        },
                        (error) => {
                            clearTimeout(timeout);
                            if (error?.message === 'Wallet disconnected') {
                                resolve();
                            } else {
                                reject(error);
                            }
                        },
                    );
                });
            } catch (error: any) {
                this.emit('error', new WalletDisconnectionError(error?.message, error));
            } finally {
                (wallet as any).handleDisconnect = handleDisconnect;
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
                const { signature } = await wallet.sign(message, 'utf8');
                return Uint8Array.from(signature);
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
