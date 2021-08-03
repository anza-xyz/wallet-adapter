import {
    EventEmitter,
    pollUntilReady,
    WalletAdapter,
    WalletAdapterEvents,
    WalletConnectionError,
    WalletDisconnectionError,
    WalletError,
    WalletNotConnectedError,
    WalletNotFoundError,
    WalletNotInstalledError,
    WalletPublicKeyError,
    WalletSignatureError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';

interface SolflareExtensionProviderEvents {
    connect: (...args: unknown[]) => unknown;
    disconnect: (...args: unknown[]) => unknown;
}

interface SolflareExtensionProvider extends EventEmitter<SolflareExtensionProviderEvents> {
    isSolflare?: boolean;
    publicKey?: PublicKey;
    isConnected: boolean;
    autoApprove: boolean;
    signTransaction: (transaction: Transaction) => Promise<Transaction>;
    signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
    connect: () => Promise<boolean>;
    disconnect: () => Promise<boolean>;
}

interface SolflareExtensionWindow extends Window {
    solflare?: SolflareExtensionProvider;
}

declare const window: SolflareExtensionWindow;

export interface SolflareExtensionWalletAdapterConfig {
    pollInterval?: number;
    pollCount?: number;
}

export class SolflareExtensionWalletAdapter extends EventEmitter<WalletAdapterEvents> implements WalletAdapter {
    private _publicKey: PublicKey | null;
    private _connecting: boolean;
    private _provider: SolflareExtensionProvider | undefined;

    constructor(config: SolflareExtensionWalletAdapterConfig = {}) {
        super();
        this._publicKey = null;
        this._connecting = false;

        if (!this.ready) pollUntilReady(this, config.pollInterval || 1000, config.pollCount || 3);
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get ready(): boolean {
        return !!window.solflare?.isSolflare;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._provider?.isConnected;
    }

    get autoApprove(): boolean {
        return !!this._provider?.autoApprove;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            const provider = window.solflare;
            if (!provider) throw new WalletNotFoundError();
            if (!provider.isSolflare) throw new WalletNotInstalledError();

            if (!provider.isConnected) {
                try {
                    if (!await provider.connect()) {
                        throw new Error('Connection rejected')
                    }
                } catch (error) {
                    if (error instanceof WalletError) throw error;
                    throw new WalletConnectionError(error?.message, error);
                }
            }

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(provider.publicKey!.toString());
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
        const provider = this._provider;
        if (provider) {
            this._publicKey = null;
            this._provider = undefined;

            try {
                if (!await provider.disconnect()) {
                    throw new Error('Failed to disconnect');
                }
            } catch (error) {
                this.emit('error', new WalletDisconnectionError(error.message, error));
            }

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
