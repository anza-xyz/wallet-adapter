import type { EventEmitter, WalletName } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type { Transaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

interface SpotWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface SpotWallet extends EventEmitter<SpotWalletEvents> {
    publicKey?: { toBytes(): Uint8Array };
    isConnected: boolean;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

interface SpotWindow extends Window {
    spotSolWallet?: SpotWallet;
}

declare const window: SpotWindow;

export interface SpotWalletAdapterConfig {}

export const SpotWalletName = 'Spot' as WalletName<'Spot'>;

export class SpotWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = SpotWalletName;
    url = 'https://spot-wallet.com';
    icon =
        'data:image/png;base64,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';
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: SpotWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: SpotWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.spotSolWallet) {
                    this._readyState = WalletReadyState.Installed;
                    this.emit('readyStateChange', this._readyState);
                    return true;
                }
                return false;
            });
        }
    }

    get publicKey() {
        return this._publicKey;
    }

    get connecting() {
        return this._connecting;
    }

    get connected() {
        return !!this._wallet?.isConnected;
    }

    get readyState() {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this._connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const wallet = window.spotSolWallet!;

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

            wallet.on('disconnect', this._disconnected);

            this._wallet = wallet;
            this._publicKey = publicKey;

            this.emit('connect', publicKey);
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
                return (await wallet.signTransaction(transaction)) as T;
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
                return (await wallet.signAllTransactions(transactions)) as T[];
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
            this._publicKey = null;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };
}
