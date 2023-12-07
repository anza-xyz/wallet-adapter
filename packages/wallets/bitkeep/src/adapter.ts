import type { WalletName } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletDisconnectionError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type { Transaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

interface BitgetWallet {
    isBitKeep?: boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getAccount(): Promise<string>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
}

interface BitgetWindow extends Window {
    bitkeep?: {
        solana?: BitgetWallet;
    };
}

declare const window: BitgetWindow;

export interface BitgetWalletAdapterConfig {}

export const BitgetWalletName = 'Bitget' as WalletName<'Bitget'>;

export class BitgetWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = BitgetWalletName;
    url = 'https://web3.bitget.com';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8yMDM1XzExMDYpIj4KPHJlY3Qgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiIGZpbGw9IiM1NEZGRjUiLz4KPGcgZmlsdGVyPSJ1cmwoI2ZpbHRlcjBfZl8yMDM1XzExMDYpIj4KPHBhdGggZD0iTTEzLjQ4MDYgMTk4LjYwNUMtMjkuMzI3NiAzMTkuMDQzIDE5OS42NjEgMjg1LjAyNyAzMTkuNTA3IDI1Mi45NjRDNDQyLjE2NSAyMTIuMjU5IDM1Ny4zODYgMzIuODI2OSAyNjkuNDE1IDI4Ljg1NThDMTgxLjQ0MyAyNC44ODQ3IDI4MC4zMjIgMTExLjgyNCAyMDUuNTk1IDEzNi42NTZDMTMwLjg2OCAxNjEuNDg3IDY2Ljk5MDcgNDguMDU4MyAxMy40ODA2IDE5OC42MDVaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c+CjxnIGZpbHRlcj0idXJsKCNmaWx0ZXIxX2ZfMjAzNV8xMTA2KSI+CjxwYXRoIGQ9Ik04NS41MTE4IC00NS44MjI1QzYzLjA1NjIgLTEwNy4xNzYgLTE2LjkxODkgLTIzLjk5NTMgLTU0LjA5OTUgMjUuMjY0M0MtODkuNTY1MiA3OC44NDc5IDMuMDA5MzcgMTI1LjE1MiAzOS4zMjA4IDEwMC4wMzdDNzUuNjMyMyA3NC45MjI3IDcuNzc0NDggNzAuMDM2MyAyOS4zNzA4IDM3LjM3ODVDNTAuOTY3MSA0LjcyMDc2IDExMy41ODEgMzAuODY5NSA4NS41MTE4IC00NS44MjI1WiIgZmlsbD0iIzAwRkZGMCIgZmlsbC1vcGFjaXR5PSIwLjY3Ii8+CjwvZz4KPGcgZmlsdGVyPSJ1cmwoI2ZpbHRlcjJfZl8yMDM1XzExMDYpIj4KPHBhdGggZD0iTTk2LjQ3OTYgMjI1LjQyNEM2NS44NTAyIDEyMi4zNjMgLTY2LjA4MTggMTc2LjYzNyAtMTI4LjIxOSAyMTYuNjU3Qy0xODcuOTkgMjY0LjA0MiAtNDYuMDcxMSA0MDAuMzQ4IDEyLjg3MjUgMzkzLjM3NkM3MS44MTYxIDM4Ni40MDMgLTM0LjQxMTggMzI3LjA2NSAxLjk4NzAyIDI5OC4xN0MzOC4zODU4IDI2OS4yNzYgMTM0Ljc2NiAzNTQuMjQ5IDk2LjQ3OTYgMjI1LjQyNFoiIGZpbGw9IiM5RDgxRkYiLz4KPC9nPgo8ZyBmaWx0ZXI9InVybCgjZmlsdGVyM19mXzIwMzVfMTEwNikiPgo8cGF0aCBkPSJNMjgyLjEyIC0xMDcuMzUzQzIxNi4wNDcgLTE4Ni4wMzEgMTIxLjQ2MyAtMTIwLjk3IDgyLjQyOTYgLTc4LjYwNDdDNDguMjczOSAtMzAuNjQ0NiAyMjQuMjc1IDU3LjIzMTIgMjczLjEyMSA0Mi4xNzE0QzMyMS45NjggMjcuMTExNSAyMDYuNTEyIC00LjA1MDM4IDIyNy4yOTcgLTMzLjI4NzlDMjQ4LjA4MiAtNjIuNTI1NSAzNjQuNzEyIC05LjAwNTY2IDI4Mi4xMiAtMTA3LjM1M1oiIGZpbGw9IiM0RDk0RkYiLz4KPC9nPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTkzLjE4OSAxNTIuODM2SDEzNi42NzRMODcuMjA4NiAxMDMuMDUxTDEzNy4zMSA1My4yNjYzTDE1MC45NTUgNDBIMTA1LjgxOUw0OC4zMzU5IDk3Ljc3NzNDNDUuNDM0OSAxMDAuNjg5IDQ1LjQ0OTggMTA1LjQwMiA0OC4zNjU2IDEwOC4yOTlMOTMuMTg5IDE1Mi44MzZaTTExOS4zMyAxMDMuMTY4SDExOC45OTVMMTE5LjMyNiAxMDMuMTY0TDExOS4zMyAxMDMuMTY4Wk0xMTkuMzMgMTAzLjE2OEwxNjguNzkxIDE1Mi45NDlMMTE4LjY5IDIwMi43MzRMMTA1LjA0NSAyMTZIMTUwLjE4TDIwNy42NjQgMTU4LjIyNkMyMTAuNTY1IDE1NS4zMTQgMjEwLjU1IDE1MC42MDIgMjA3LjYzNCAxNDcuNzA1TDE2Mi44MTEgMTAzLjE2OEgxMTkuMzNaIiBmaWxsPSJibGFjayIvPgo8L2c+CjxkZWZzPgo8ZmlsdGVyIGlkPSJmaWx0ZXIwX2ZfMjAzNV8xMTA2IiB4PSItOTAuMjQxMSIgeT0iLTY5LjczNjkiIHdpZHRoPSI1NjkuNTU4IiBoZWlnaHQ9IjQ1MS40MzEiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KPGZlRmxvb2QgZmxvb2Qtb3BhY2l0eT0iMCIgcmVzdWx0PSJCYWNrZ3JvdW5kSW1hZ2VGaXgiLz4KPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJCYWNrZ3JvdW5kSW1hZ2VGaXgiIHJlc3VsdD0ic2hhcGUiLz4KPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iNDkuMjMwOCIgcmVzdWx0PSJlZmZlY3QxX2ZvcmVncm91bmRCbHVyXzIwMzVfMTEwNiIvPgo8L2ZpbHRlcj4KPGZpbHRlciBpZD0iZmlsdGVyMV9mXzIwMzVfMTEwNiIgeD0iLTE2MC41MTEiIHk9Ii0xNjUuOTg3IiB3aWR0aD0iMzUxLjU5NiIgaGVpZ2h0PSIzNzEuNTA3IiBmaWx0ZXJVbml0cz0idXNlclNwYWNlT25Vc2UiIGNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycz0ic1JHQiI+CjxmZUZsb29kIGZsb29kLW9wYWNpdHk9IjAiIHJlc3VsdD0iQmFja2dyb3VuZEltYWdlRml4Ii8+CjxmZUJsZW5kIG1vZGU9Im5vcm1hbCIgaW49IlNvdXJjZUdyYXBoaWMiIGluMj0iQmFja2dyb3VuZEltYWdlRml4IiByZXN1bHQ9InNoYXBlIi8+CjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjQ5LjIzMDgiIHJlc3VsdD0iZWZmZWN0MV9mb3JlZ3JvdW5kQmx1cl8yMDM1XzExMDYiLz4KPC9maWx0ZXI+CjxmaWx0ZXIgaWQ9ImZpbHRlcjJfZl8yMDM1XzExMDYiIHg9Ii0yNDEuMDc4IiB5PSI2Ny42NDIiIHdpZHRoPSI0NDQuODUxIiBoZWlnaHQ9IjQyNC40NTIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KPGZlRmxvb2QgZmxvb2Qtb3BhY2l0eT0iMCIgcmVzdWx0PSJCYWNrZ3JvdW5kSW1hZ2VGaXgiLz4KPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJCYWNrZ3JvdW5kSW1hZ2VGaXgiIHJlc3VsdD0ic2hhcGUiLz4KPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iNDkuMjMwOCIgcmVzdWx0PSJlZmZlY3QxX2ZvcmVncm91bmRCbHVyXzIwMzVfMTEwNiIvPgo8L2ZpbHRlcj4KPGZpbHRlciBpZD0iZmlsdGVyM19mXzIwMzVfMTEwNiIgeD0iLTIwLjM5NjgiIHk9Ii0yNDIuNzU4IiB3aWR0aD0iNDMwLjE5MSIgaGVpZ2h0PSIzODUuMTA1IiBmaWx0ZXJVbml0cz0idXNlclNwYWNlT25Vc2UiIGNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycz0ic1JHQiI+CjxmZUZsb29kIGZsb29kLW9wYWNpdHk9IjAiIHJlc3VsdD0iQmFja2dyb3VuZEltYWdlRml4Ii8+CjxmZUJsZW5kIG1vZGU9Im5vcm1hbCIgaW49IlNvdXJjZUdyYXBoaWMiIGluMj0iQmFja2dyb3VuZEltYWdlRml4IiByZXN1bHQ9InNoYXBlIi8+CjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjQ5LjIzMDgiIHJlc3VsdD0iZWZmZWN0MV9mb3JlZ3JvdW5kQmx1cl8yMDM1XzExMDYiLz4KPC9maWx0ZXI+CjxjbGlwUGF0aCBpZD0iY2xpcDBfMjAzNV8xMTA2Ij4KPHJlY3Qgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==';
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: BitgetWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: BitgetWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.bitkeep?.solana?.isBitKeep) {
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
            const wallet = window.bitkeep!.solana!;

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
                return signature;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
}

/**
 * @deprecated Use 'BitgetWalletName' instead."
 */
export const BitKeepWalletName = BitgetWalletName;

/**
 * @deprecated Use 'BitgetWalletAdapterConfig' instead."
 */
export type BitKeepWalletAdapterConfig = BitgetWalletAdapterConfig;

/**
 * @deprecated Use 'BitgetWalletAdapter' instead."
 */
export const BitKeepWalletAdapter = BitgetWalletAdapter;
