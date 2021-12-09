import {
    BaseMessageSignerWalletAdapter,
    WalletAdapterNetwork,
    pollUntilReady,
    WalletError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletNotConnectedError,
    WalletNotFoundError,
    WalletNotInstalledError,
    WalletPublicKeyError,
    WalletSignTransactionError,
    WalletWindowClosedError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';
import { LegacyOneKeyWallet, LegacyOneKeyWalletAdapter } from './legacyAdapter';
import { EventEmitter } from '@solana/wallet-adapter-base/lib/adapter';
import utils from './utils';

interface OneKeyWalletEvents {
    connect(...args: unknown[]): unknown;

    disconnect(...args: unknown[]): unknown;
}

export interface OneKeyWallet extends EventEmitter<OneKeyWalletEvents> {
    isOneKey?: boolean;
    isPhantom?: boolean;
    publicKey?: { toBytes(): Uint8Array };
    isConnected: boolean;

    signTransaction(transaction: Transaction): Promise<Transaction>;

    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;

    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;

    connect(): Promise<void>;

    disconnect(): Promise<void>;

    _handleDisconnect(...args: unknown[]): unknown;
}

interface OneKeyContainer {
    solana?: OneKeyWallet;
    sollet?: LegacyOneKeyWallet;
}

interface OneKeyWindow extends Window {
    $onekey?: OneKeyContainer;
    solana?: OneKeyWallet;
    sollet?: LegacyOneKeyWallet;
}

declare const window: OneKeyWindow;

export interface OneKeyWalletAdapterConfig {
    pollInterval?: number;
    pollCount?: number;
    provider?: string | LegacyOneKeyWallet;
    network?: WalletAdapterNetwork;
}

export class OneKeyWalletAdapter extends BaseMessageSignerWalletAdapter {
    private _connecting: boolean;
    private _wallet: OneKeyWallet | null;
    private _publicKey: PublicKey | null;
    private _getProvider: () => OneKeyWallet | null;
    private _legacyAdapter: LegacyOneKeyWalletAdapter | null;

    constructor(config: OneKeyWalletAdapterConfig = {}) {
        super();
        const provider = utils.getProvider();
        const legacyProvider = utils.getLegacyProvider();

        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
        this._getProvider = utils.getProvider;

        if (legacyProvider && !provider) {
            this._legacyAdapter = new LegacyOneKeyWalletAdapter(config);
        } else {
            this._legacyAdapter = null;
            if (!this.ready) pollUntilReady(this, config.pollInterval || 1000, config.pollCount || 3);
        }
    }

    get publicKey(): PublicKey | null {
        if (this._legacyAdapter) {
            return this._legacyAdapter.publicKey;
        }
        return this._publicKey;
    }

    get ready(): boolean {
        if (this._legacyAdapter) {
            return this._legacyAdapter.ready;
        }
        return Boolean(this._getProvider());
    }

    get connecting(): boolean {
        if (this._legacyAdapter) {
            return this._legacyAdapter.connecting;
        }
        return this._connecting;
    }

    get connected(): boolean {
        if (this._legacyAdapter) {
            return this._legacyAdapter.connected;
        }
        return !!this._wallet?.isConnected;
    }

    async connect(): Promise<void> {
        if (this._legacyAdapter) {
            return this._legacyAdapter.connect();
        }
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            const wallet = typeof window !== 'undefined' && this._getProvider();
            if (!wallet) throw new WalletNotFoundError();
            if (!wallet.isOneKey) throw new WalletNotInstalledError();

            if (!wallet.isConnected) {
                const handleDisconnect = wallet._handleDisconnect;
                try {
                    await new Promise<void>((resolve, reject) => {
                        const connect = () => {
                            wallet.off('connect', connect);
                            resolve();
                        };

                        wallet._handleDisconnect = (...args: unknown[]) => {
                            wallet.off('connect', connect);
                            reject(new WalletWindowClosedError());
                            return handleDisconnect.apply(wallet, args);
                        };

                        wallet.on('connect', connect);

                        wallet.connect().catch((reason: any) => {
                            wallet.off('connect', connect);
                            reject(reason);
                        });
                    });
                } catch (error: any) {
                    if (error instanceof WalletError) throw error;
                    throw new WalletConnectionError(error?.message, error);
                } finally {
                    wallet._handleDisconnect = handleDisconnect;
                }
            }

            if (!wallet.publicKey) throw new WalletConnectionError();

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(wallet.publicKey.toBytes());
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            wallet.on('disconnect', this._disconnected);

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
        if (this._legacyAdapter) {
            return this._legacyAdapter.disconnect();
        }
        const wallet = this._wallet;
        if (wallet) {
            wallet.off('disconnect', this._disconnected);

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

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        if (this._legacyAdapter) {
            return this._legacyAdapter.signTransaction(transaction);
        }
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
        if (this._legacyAdapter) {
            return this._legacyAdapter.signAllTransactions(transactions);
        }
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
        if (this._legacyAdapter) {
            return this._legacyAdapter.signMessage(message);
        }
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const { signature } = await wallet.signMessage(message);
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

        const wallet = this._wallet;
        if (wallet) {
            wallet.off('disconnect', this._disconnected);

            this._wallet = null;
            this._publicKey = null;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };

}
