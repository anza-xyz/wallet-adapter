import type { WalletName } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type { Transaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

interface CloverWallet {
    isCloverWallet?: boolean;
    getAccount(): Promise<string>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
}

interface CloverWalletWindow extends Window {
    clover_solana?: CloverWallet;
}

declare const window: CloverWalletWindow;

export interface CloverWalletAdapterConfig {}

export const CloverWalletName = 'Clover' as WalletName<'Clover'>;

export class CloverWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = CloverWalletName;
    url = 'https://clv.org';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTM2LjQ4IDBIMTEuNTJDNS4xNTc2OCAwIDAgNS4xNTc2OCAwIDExLjUyVjM2LjQ4QzAgNDIuODQyMyA1LjE1NzY4IDQ4IDExLjUyIDQ4SDM2LjQ4QzQyLjg0MjMgNDggNDggNDIuODQyMyA0OCAzNi40OFYxMS41MkM0OCA1LjE1NzY4IDQyLjg0MjMgMCAzNi40OCAwWiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzc5MTBfMTYzMzUxKSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTI0LjAwMDYgMzkuMzYwNkMzMi40ODM3IDM5LjM2MDYgMzkuMzYwNiAzMi40ODM3IDM5LjM2MDYgMjQuMDAwNkMzOS4zNjA2IDE1LjUxNzUgMzIuNDgzNyA4LjY0MDYyIDI0LjAwMDYgOC42NDA2MkMxNS41MTc1IDguNjQwNjIgOC42NDA2MiAxNS41MTc1IDguNjQwNjIgMjQuMDAwNkM4LjY0MDYyIDMyLjQ4MzcgMTUuNTE3NSAzOS4zNjA2IDI0LjAwMDYgMzkuMzYwNlpNMjEuMjg5OSAxNS44Njg4SDI2LjcxMVYyMS4zNDdIMjEuMjkwNFYyNi42NTRIMjYuNzExVjMyLjEzMjJIMjEuMjg5OVYyNi44MjUySDE1Ljg2OTNWMjEuMzQ3SDIxLjI4OTlWMTUuODY4OFpNMjYuNzEyIDIxLjM0N0gzMi4xMzMxVjI2LjgyNTJIMjYuNzEyVjIxLjM0N1oiIGZpbGw9ImJsYWNrIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfNzkxMF8xNjMzNTEiIHgxPSI0OCIgeTE9Ii0xLjQzMDUxZS0wNiIgeDI9IjEuNDMwNTFlLTA2IiB5Mj0iNDgiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0E5RkZFMCIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM4NkQ1RkYiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4=';
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: CloverWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: CloverWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.clover_solana?.isCloverWallet) {
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

    get readyState() {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this._connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const wallet = window.clover_solana!;

            let account: string;
            try {
                account = await wallet.getAccount();
            } catch (error: any) {
                throw new WalletAccountError(error?.message, error);
            }

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(account);
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

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
        if (this._wallet) {
            this._wallet = null;
            this._publicKey = null;
        }

        this.emit('disconnect');
    }

    async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return ((await wallet.signTransaction(transaction)) as T) || transaction;
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
                return ((await wallet.signAllTransactions(transactions)) as T[]) || transactions;
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
                return Uint8Array.from(signature);
            } catch (error: any) {
                throw new WalletSignMessageError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
}
