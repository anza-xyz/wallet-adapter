import type { EventEmitter, SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    isVersionedTransaction,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSendTransactionError,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type {
    Connection,
    SendOptions,
    Transaction,
    TransactionSignature,
    VersionedTransaction,
} from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

interface OKXWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
    accountChanged(newPublicKey: PublicKey): unknown;
}

interface OKXWallet extends EventEmitter<OKXWalletEvents> {
    isOkxWallet?: boolean;
    publicKey?: { toBytes(): Uint8Array };
    isConnected: boolean;
    signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
    signAndSendTransaction<T extends Transaction | VersionedTransaction>(
        transaction: T,
        options?: SendOptions
    ): Promise<{ signature: TransactionSignature }>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

interface OKXWalletWindow extends Window {
    okxwallet?: {
        solana?: OKXWallet;
    };
}

declare const window: OKXWalletWindow;

export interface OKXWalletAdapterConfig {}

export const OKXWalletName = 'OKX Wallet' as WalletName<'OKX Wallet'>;

export class OKXWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = OKXWalletName;
    url = 'https://okx.com';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTIzLjU1ODMgMTUuODk2NUgxNi40NDc0QzE2LjE0NTMgMTUuODk2NSAxNS45MDA0IDE2LjE0MTQgMTUuOTAwNCAxNi40NDM1VjIzLjU1NDRDMTUuOTAwNCAyMy44NTY1IDE2LjE0NTMgMjQuMTAxNCAxNi40NDc0IDI0LjEwMTRIMjMuNTU4M0MyMy44NjA0IDI0LjEwMTQgMjQuMTA1MyAyMy44NTY1IDI0LjEwNTMgMjMuNTU0NFYxNi40NDM1QzI0LjEwNTMgMTYuMTQxNCAyMy44NjA0IDE1Ljg5NjUgMjMuNTU4MyAxNS44OTY1WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2LjQ0NzQgMTYuMzk2NUgyMy41NTgzQzIzLjU4NDIgMTYuMzk2NSAyMy42MDUzIDE2LjQxNzUgMjMuNjA1MyAxNi40NDM1VjIzLjU1NDRDMjMuNjA1MyAyMy41ODAzIDIzLjU4NDIgMjMuNjAxNCAyMy41NTgzIDIzLjYwMTRIMTYuNDQ3NEMxNi40MjE0IDIzLjYwMTQgMTYuNDAwNCAyMy41ODAzIDE2LjQwMDQgMjMuNTU0NFYxNi40NDM1QzE2LjQwMDQgMTYuNDE3NSAxNi40MjE0IDE2LjM5NjUgMTYuNDQ3NCAxNi4zOTY1WiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMTUiLz4KPHBhdGggZD0iTTE1LjM1MDMgNy42OTE0MUg4LjIzOTM3QzcuOTM3MjggNy42OTE0MSA3LjY5MjM4IDcuOTM2MyA3LjY5MjM4IDguMjM4NFYxNS4zNDkzQzcuNjkyMzggMTUuNjUxNCA3LjkzNzI4IDE1Ljg5NjMgOC4yMzkzNyAxNS44OTYzSDE1LjM1MDNDMTUuNjUyMyAxNS44OTYzIDE1Ljg5NzIgMTUuNjUxNCAxNS44OTcyIDE1LjM0OTNWOC4yMzg0QzE1Ljg5NzIgNy45MzYzIDE1LjY1MjMgNy42OTE0MSAxNS4zNTAzIDcuNjkxNDFaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNOC4yMzkzNyA4LjE5MTQxSDE1LjM1MDNDMTUuMzc2MiA4LjE5MTQxIDE1LjM5NzIgOC4yMTI0NSAxNS4zOTcyIDguMjM4NFYxNS4zNDkzQzE1LjM5NzIgMTUuMzc1MiAxNS4zNzYyIDE1LjM5NjMgMTUuMzUwMyAxNS4zOTYzSDguMjM5MzdDOC4yMTM0MiAxNS4zOTYzIDguMTkyMzggMTUuMzc1MiA4LjE5MjM4IDE1LjM0OTNWOC4yMzg0QzguMTkyMzggOC4yMTI0NCA4LjIxMzQyIDguMTkxNDEgOC4yMzkzNyA4LjE5MTQxWiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMTUiLz4KPHBhdGggZD0iTTMxLjc2MDQgNy42OTE0MUgyNC42NDk1QzI0LjM0NzQgNy42OTE0MSAyNC4xMDI1IDcuOTM2MyAyNC4xMDI1IDguMjM4NFYxNS4zNDkzQzI0LjEwMjUgMTUuNjUxNCAyNC4zNDc0IDE1Ljg5NjMgMjQuNjQ5NSAxNS44OTYzSDMxLjc2MDRDMzIuMDYyNSAxNS44OTYzIDMyLjMwNzQgMTUuNjUxNCAzMi4zMDc0IDE1LjM0OTNWOC4yMzg0QzMyLjMwNzQgNy45MzYzIDMyLjA2MjUgNy42OTE0MSAzMS43NjA0IDcuNjkxNDFaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjQuNjQ5NSA4LjE5MTQxSDMxLjc2MDRDMzEuNzg2NCA4LjE5MTQxIDMxLjgwNzQgOC4yMTI0NSAzMS44MDc0IDguMjM4NFYxNS4zNDkzQzMxLjgwNzQgMTUuMzc1MiAzMS43ODY0IDE1LjM5NjMgMzEuNzYwNCAxNS4zOTYzSDI0LjY0OTVDMjQuNjIzNiAxNS4zOTYzIDI0LjYwMjUgMTUuMzc1MiAyNC42MDI1IDE1LjM0OTNWOC4yMzg0QzI0LjYwMjUgOC4yMTI0NCAyNC42MjM2IDguMTkxNDEgMjQuNjQ5NSA4LjE5MTQxWiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMTUiLz4KPHBhdGggZD0iTTE1LjM1MDMgMjQuMDk5Nkg4LjIzOTM3QzcuOTM3MjggMjQuMDk5NiA3LjY5MjM4IDI0LjM0NDUgNy42OTIzOCAyNC42NDY2VjMxLjc1NzVDNy42OTIzOCAzMi4wNTk2IDcuOTM3MjggMzIuMzA0NSA4LjIzOTM3IDMyLjMwNDVIMTUuMzUwM0MxNS42NTI0IDMyLjMwNDUgMTUuODk3MyAzMi4wNTk2IDE1Ljg5NzMgMzEuNzU3NVYyNC42NDY2QzE1Ljg5NzMgMjQuMzQ0NSAxNS42NTI0IDI0LjA5OTYgMTUuMzUwMyAyNC4wOTk2WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTguMjM5MzcgMjQuNTk5NkgxNS4zNTAzQzE1LjM3NjIgMjQuNTk5NiAxNS4zOTczIDI0LjYyMDYgMTUuMzk3MyAyNC42NDY2VjMxLjc1NzVDMTUuMzk3MyAzMS43ODM0IDE1LjM3NjIgMzEuODA0NSAxNS4zNTAzIDMxLjgwNDVIOC4yMzkzN0M4LjIxMzQyIDMxLjgwNDUgOC4xOTIzOCAzMS43ODM0IDguMTkyMzggMzEuNzU3NVYyNC42NDY2QzguMTkyMzggMjQuNjIwNiA4LjIxMzQyIDI0LjU5OTYgOC4yMzkzNyAyNC41OTk2WiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMTUiLz4KPHBhdGggZD0iTTMxLjc2MDQgMjQuMDk5NkgyNC42NDk1QzI0LjM0NzQgMjQuMDk5NiAyNC4xMDI1IDI0LjM0NDUgMjQuMTAyNSAyNC42NDY2VjMxLjc1NzVDMjQuMTAyNSAzMi4wNTk2IDI0LjM0NzQgMzIuMzA0NSAyNC42NDk1IDMyLjMwNDVIMzEuNzYwNEMzMi4wNjI1IDMyLjMwNDUgMzIuMzA3NCAzMi4wNTk2IDMyLjMwNzQgMzEuNzU3NVYyNC42NDY2QzMyLjMwNzQgMjQuMzQ0NSAzMi4wNjI1IDI0LjA5OTYgMzEuNzYwNCAyNC4wOTk2WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTI0LjY0OTUgMjQuNTk5NkgzMS43NjA0QzMxLjc4NjQgMjQuNTk5NiAzMS44MDc0IDI0LjYyMDYgMzEuODA3NCAyNC42NDY2VjMxLjc1NzVDMzEuODA3NCAzMS43ODM0IDMxLjc4NjQgMzEuODA0NSAzMS43NjA0IDMxLjgwNDVIMjQuNjQ5NUMyNC42MjM2IDMxLjgwNDUgMjQuNjAyNSAzMS43ODM0IDI0LjYwMjUgMzEuNzU3NVYyNC42NDY2QzI0LjYwMjUgMjQuNjIwNiAyNC42MjM2IDI0LjU5OTYgMjQuNjQ5NSAyNC41OTk2WiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMTUiLz4KPC9zdmc+Cg==';
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: OKXWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: OKXWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.okxwallet?.solana?.isOkxWallet) {
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

    async autoConnect(): Promise<void> {
        // Skip autoconnect in the Loadable state
        // We can't redirect to a universal link without user input
        if (this.readyState === WalletReadyState.Installed) {
            await this.connect();
        }
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;

            if (this.readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this._connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const wallet = window.okxwallet!.solana!;

            if (!wallet.isConnected) {
                try {
                    await wallet.connect();
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
                }
            }

            if (!wallet.publicKey) throw new WalletAccountError();

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(wallet.publicKey.toBytes());
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            wallet.on('disconnect', this._disconnected);
            wallet.on('accountChanged', this._accountChanged);

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
            wallet.off('accountChanged', this._accountChanged);

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

    async sendTransaction<T extends Transaction | VersionedTransaction>(
        transaction: T,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const { signers, ...sendOptions } = options;

                if (isVersionedTransaction(transaction)) {
                    signers?.length && transaction.sign(signers);
                } else {
                    transaction = (await this.prepareTransaction(transaction, connection, sendOptions)) as T;
                    signers?.length && (transaction as Transaction).partialSign(...signers);
                }

                sendOptions.preflightCommitment = sendOptions.preflightCommitment || connection.commitment;

                const { signature } = await wallet.signAndSendTransaction(transaction, sendOptions);
                return signature;
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletSendTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
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

    async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
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
            wallet.off('accountChanged', this._accountChanged);

            this._wallet = null;
            this._publicKey = null;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };

    private _accountChanged = (newPublicKey: PublicKey) => {
        const publicKey = this._publicKey;
        if (!publicKey) return;

        try {
            newPublicKey = new PublicKey(newPublicKey.toBytes());
        } catch (error: any) {
            this.emit('error', new WalletPublicKeyError(error?.message, error));
            return;
        }

        if (publicKey.equals(newPublicKey)) return;

        this._publicKey = newPublicKey;
        this.emit('connect', newPublicKey);
    };
}
