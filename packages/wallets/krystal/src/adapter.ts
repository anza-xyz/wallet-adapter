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
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type { Transaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

interface KrystalWallet {
    isConnected(): boolean;
    connect(): Promise<string[]>;
    disconnect(): Promise<void>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}

interface KrystalWindow extends Window {
    krystal?: {
        solana?: KrystalWallet;
    };
}

declare const window: KrystalWindow;

export interface KrystalWalletAdapterConfig {}

export const KrystalWalletName = 'Krystal' as WalletName<'Krystal'>;

export class KrystalWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = KrystalWalletName;
    url = 'https://krystal.app';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSIjMDEwMTAxIi8+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiByeD0iMTAwIiBmaWxsPSIjMDEwMTAxIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjkxLjg4NyA4MC44NDA3QzI5MS44ODcgNzUuMDgyNiAyOTcuNTg1IDcxLjA1NzYgMzAzLjAxMiA3Mi45ODJMMzc3LjYxOCA5OS40Mzc2QzM4My4wMyAxMDEuMzU3IDM4NC45MjggMTA4LjA0MyAzODEuMzMxIDExMi41MTlMMzA2LjcyNSAyMDUuMzcyQzMwMS43OTQgMjExLjUxIDI5MS44ODcgMjA4LjAyMyAyOTEuODg3IDIwMC4xNVY4MC44NDA3Wk0xNTIuMzUzIDE3Mi4zM0MxNDYuMjg1IDE3NS44NDYgMTQ3LjAwNiAxODQuODI4IDE1My41NTcgMTg3LjMzM0wyNjYuMTEyIDIzMC4zNTNDMjcxLjU3MSAyMzIuNDQgMjc3LjQyNyAyMjguNDA5IDI3Ny40MjcgMjIyLjU2NVYxMTQuMzE5QzI3Ny40MjcgMTA3Ljg5NSAyNzAuNDY3IDEwMy44ODQgMjY0LjkwOCAxMDcuMTA1TDE1Mi4zNTMgMTcyLjMzWk03Mi41MjcyIDI5MC40NzJDNzIuMDY0MSAyOTYuMTg5IDc3LjM3NzUgMzAwLjY1NSA4Mi45Mjk3IDI5OS4yMTdMMjQ5LjkwNyAyNTUuOTQ1QzI1Ny43NjkgMjUzLjkwOCAyNTguMzc1IDI0Mi45NzcgMjUwLjc4NyAyNDAuMDgzTDkyLjIxMiAxNzkuNjEzQzg3LjAxOTEgMTc3LjYzMyA4MS4zNzg5IDE4MS4xOTEgODAuOTMwMiAxODYuNzNMNzIuNTI3MiAyOTAuNDcyWk0yNDkuOTA4IDI4Ni45M0MyNTIuMTQ2IDI4MC42MjcgMjQ2LjQyNCAyNzQuMzg3IDIzOS45NSAyNzYuMDcyTDEyNy42NDkgMzA1LjMwMkMxMjEuMzU3IDMwNi45MzkgMTE5LjI3NyAzMTQuODI5IDEyMy45NDQgMzE5LjM1NkwxOTkuNzYgMzkyLjkwNEMyMDQuMTE5IDM5Ny4xMzIgMjExLjM5MiAzOTUuNDMyIDIxMy40MjQgMzg5LjcwOEwyNDkuOTA4IDI4Ni45M1pNMzExLjk0MyAyNDQuMTQ3QzMwNS44MzEgMjQyLjg5NiAzMDMuMjA4IDIzNS42MjMgMzA3LjExNCAyMzAuNzU4TDM4NS43MDMgMTMyLjg4MkMzOTAuMTMyIDEyNy4zNjUgMzk4Ljk4NyAxMjkuNTI1IDQwMC4zNzkgMTM2LjQ2MUw0MjQuMjI5IDI1NS4zMTJDNDI1LjQwMyAyNjEuMTY0IDQyMC4yMjggMjY2LjMxOCA0MTQuMzgxIDI2NS4xMjFMMzExLjk0MyAyNDQuMTQ3Wk0zMjEuMjA0IDI2NC4wNjhDMzEzLjI5MSAyNjIuNDQyIDMwNy45MjEgMjcxLjg5MiAzMTMuMzY4IDI3Ny44NThMNDE1Ljc3OSAzOTAuMDMxQzQyMC41NDMgMzk1LjI0OSA0MjkuMjMxIDM5Mi41NDggNDMwLjE5NyAzODUuNTQ5TDQ0Mi40MjIgMjk2LjkzMkM0NDMuMDIyIDI5Mi41OCA0NDAuMTQzIDI4OC41MDkgNDM1Ljg0IDI4Ny42MjVMMzIxLjIwNCAyNjQuMDY4Wk0yNzYuMjQ3IDMwMi44MDhDMjc2LjA3NSAyOTMuNTM3IDI2My4xNzEgMjkxLjQyOCAyNjAuMDU2IDMwMC4xNjFMMjE1LjA1MiA0MjYuMzYyQzIxMi44NzUgNDMyLjQ2NSAyMTguMTg4IDQzOC42MTEgMjI0LjU0MyA0MzcuMzM4TDI3MS43MDcgNDI3Ljg5M0MyNzUuNjYgNDI3LjEwMiAyNzguNDgxIDQyMy41OTUgMjc4LjQwNiA0MTkuNTYzTDI3Ni4yNDcgMzAyLjgwOFpNMjkyLjI5NiAzMDQuMDM2QzI5Mi4xNTMgMjk2LjM2OSAzMDEuNTYzIDI5Mi41OTEgMzA2Ljc2MiAyOTguMjI4TDM4MS43NjUgMzc5LjU2QzM4Ni4yMTggMzg0LjM4OCAzODMuNTk5IDM5Mi4yMyAzNzcuMTM5IDM5My40MTRMMzAzLjkgNDA2LjgzM0MyOTguODQxIDQwNy43NiAyOTQuMTU3IDQwMy45MyAyOTQuMDYxIDM5OC43ODdMMjkyLjI5NiAzMDQuMDM2WiIgZmlsbD0iIzFERTlCNiIvPgo8L3N2Zz4K';
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: KrystalWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: KrystalWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.krystal?.solana) {
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
        return !!this._wallet?.isConnected();
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
            const wallet = window.krystal!.solana!;

            let account: string;
            try {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                account = (await wallet.connect())[0]!;
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
}
