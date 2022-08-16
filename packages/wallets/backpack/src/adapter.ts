import type { EventEmitter, SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
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
    WalletSendTransactionError,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type { Connection, SendOptions, Signer, Transaction, TransactionSignature } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

interface BackpackWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface BackpackWallet extends EventEmitter<BackpackWalletEvents> {
    isBackpack?: boolean;
    publicKey?: { toBytes(): Uint8Array };
    isConnected: boolean;
    signTransaction(transaction: Transaction, publicKey?: PublicKey | null): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[], publicKey?: PublicKey | null): Promise<Transaction[]>;
    send(
        transaction: Transaction,
        signers?: Signer[],
        options?: SendOptions,
        connection?: Connection,
        publicKey?: PublicKey | null
    ): Promise<TransactionSignature>;
    signMessage(message: Uint8Array, publicKey?: PublicKey | null): Promise<Uint8Array>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

interface BackpackWindow extends Window {
    backpack?: BackpackWallet;
}

declare const window: BackpackWindow;

export interface BackpackWalletAdapterConfig {}

export const BackpackWalletName = 'Backpack' as WalletName<'Backpack'>;

export class BackpackWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = BackpackWalletName;
    url = 'https://backpack.app';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBjbGlwLXBhdGg9InVybCgjY2xpcDBfNjMzMl8zMzMyNikiPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTUwNi42NzcgMTA4LjkxN0M1MzYuNzU0IDEwOC45MTcgNTYxLjEzNiA4NC41MzUxIDU2MS4xMzYgNTQuNDU4NUM1NjEuMTM2IDI0LjM4MTkgNTM2Ljc1NCAwIDUwNi42NzcgMEM0NzYuNjAxIDAgNDUyLjIxOSAyNC4zODE5IDQ1Mi4yMTkgNTQuNDU4NUM0NTIuMjE5IDg0LjUzNTEgNDc2LjYwMSAxMDguOTE3IDUwNi42NzcgMTA4LjkxN1pNNjYxLjg0NyA4MjkuOTY3QzYxNy4xNiA4MzkuMDg1IDU4My41MzggODc4LjYxMyA1ODMuNTM4IDkyNS45OTRDNTgzLjUzOCA5ODAuMTIxIDYyNy40MTcgMTAyNCA2ODEuNTQ1IDEwMjRDNzExLjE3IDEwMjQgNzM3LjcyNiAxMDEwLjg2IDc1NS42OTcgOTkwLjA4Qzc5MC4xOTIgOTUxLjIwOSA3OTcuOTcyIDk0NS44NDYgODYwLjk2NiA5NDEuOTg4QzkyMy4zMDUgOTM4LjY1MiA5NzIuODI2IDg4Ny4wNDcgOTcyLjgyNiA4MjMuODc2Qzk3Mi44MjYgNzU4LjU0OSA5MTkuODY5IDcwNS41OTIgODU0LjU0MyA3MDUuNTkyQzgxMS45MjEgNzA1LjU5MiA3NzQuNTY0IDcyOC4xMzUgNzUzLjc0NSA3NjEuOTQ5QzcyMC40NjUgODE0LjI5OSA3MTEuNzg2IDgxOC43MDMgNjYxLjg0NyA4MjkuOTY3Wk0xMDEyLjc0IDI3Ny4xMjJDMTAxMi43NCAzMjMuNzg0IDk3NC45MTQgMzYxLjYxIDkyOC4yNTIgMzYxLjYxQzkwMS41NjUgMzYxLjYxIDg3Ny43NjkgMzQ5LjIzNyA4NjIuMjg1IDMyOS45MTVMODYyLjI4NCAzMjkuOTE4QzgzMS41ODIgMjkxLjU2IDgxOC40NzcgMjgzLjI1OCA3NTMuOTcxIDI5Mi4yM0M3NDguMTk5IDI5My4xMzQgNzQyLjI4NCAyOTMuNjAyIDczNi4yNTggMjkzLjYwMkM2NzMuNDkgMjkzLjYwMiA2MjIuNjA2IDI0Mi43MTggNjIyLjYwNiAxNzkuOTVDNjIyLjYwNiAxMTcuMTgxIDY3My40OSA2Ni4yOTczIDczNi4yNTggNjYuMjk3M0M3ODAuMzcxIDY2LjI5NzMgODE4LjYxNSA5MS40Mjk3IDgzNy40NSAxMjguMTU3Qzg2OC4xNCAxODQuODM2IDg4Mi42NDUgMTkwLjYzOSA5MzEuMTQ5IDE5Mi42ODJDOTc2LjQ3IDE5NC4yMDkgMTAxMi43NCAyMzEuNDMgMTAxMi43NCAyNzcuMTIyWk0zNjUuODkzIDM4OC4wNzRDMzk4Ljg1MiAzNjQuMjI0IDQyMC4yOTUgMzI1LjQzOSA0MjAuMjk1IDI4MS42NDZDNDIwLjI5NSAyMDkuMTQxIDM2MS41MTggMTUwLjM2NCAyODkuMDEzIDE1MC4zNjRDMjE2LjUwOCAxNTAuMzY0IDE1Ny43MzEgMjA5LjE0MSAxNTcuNzMxIDI4MS42NDZDMTU3LjczMSAyODUuNDcgMTU3Ljg5NCAyODkuMjU1IDE1OC4yMTUgMjkyLjk5NkMxNjYuMTQxIDM5MS45ODMgMTU1LjY3MiA0MTcuMjIyIDcxLjMwODEgNDc2Ljk2OEMzNS4zMTkgNTAxLjcyNyAxMS43MjI3IDU0My4yMDIgMTEuNzIyNyA1OTAuMTg4QzExLjcyMjcgNjY2LjAzNCA3My4yMDc1IDcyNy41MTggMTQ5LjA1MyA3MjcuNTE4QzIyNC44OTggNzI3LjUxOCAyODYuMzgzIDY2Ni4wMzQgMjg2LjM4MyA1OTAuMTg4QzI4Ni4zODMgNTg0LjczOCAyODYuMDY2IDU3OS4zNjIgMjg1LjQ0OCA1NzQuMDc3QzI3NC44NjYgNDcxLjU4NCAyODYuODU4IDQ0Ni45MTcgMzY1Ljg5MyAzODguMDc0Wk01MTMuNjkzIDg3My43MDVDNTEzLjY5MyA5NTYuMDg5IDQ0Ni45MDggMTAyMi44NyAzNjQuNTI0IDEwMjIuODdDMjgyLjE0IDEwMjIuODcgMjE1LjM1NSA5NTYuMDg5IDIxNS4zNTUgODczLjcwNUMyMTUuMzU1IDc5MS4zMjEgMjgyLjE0IDcyNC41MzYgMzY0LjUyNCA3MjQuNTM2QzQ0Ni45MDggNzI0LjUzNiA1MTMuNjkzIDc5MS4zMjEgNTEzLjY5MyA4NzMuNzA1WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzYzMzJfMzMzMjYpIi8+CjwvZz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl82MzMyXzMzMzI2IiB4MT0iMTUwLjI4NCIgeTE9IjIxMS4zMDIiIHgyPSIxMTYwLjQyIiB5Mj0iNjQ5LjYyMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjM0VFQ0I4Ii8+CjxzdG9wIG9mZnNldD0iMC41MDkzMjMiIHN0b3AtY29sb3I9IiNBMzcyRkUiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkU3RDRBIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxjbGlwUGF0aCBpZD0iY2xpcDBfNjMzMl8zMzMyNiI+CjxyZWN0IHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==';

    private _connecting: boolean;
    private _wallet: BackpackWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: BackpackWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.backpack?.isBackpack) {
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
            const wallet = window.backpack!;

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

    async sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            const { signers, ...sendOptions } = options;

            try {
                return await wallet.send(transaction, signers, sendOptions, connection, this.publicKey);
            } catch (error: any) {
                throw new WalletSendTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return await wallet.signTransaction(transaction, this.publicKey);
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
                return await wallet.signAllTransactions(transactions, this.publicKey);
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
                return await wallet.signMessage(message, this.publicKey);
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
