import type { EventEmitter, SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
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
import type { Connection, SendOptions, Transaction, TransactionSignature } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

interface TrustWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface TrustWallet extends EventEmitter<TrustWalletEvents> {
    isTrust?: boolean;
    publicKey?: { toBytes(): Uint8Array };
    isConnected: boolean;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signAndSendTransaction(
        transaction: Transaction,
        options?: SendOptions
    ): Promise<{ signature: TransactionSignature }>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

interface TrustWindow extends Window {
    trustwallet?: {
        solana?: TrustWallet;
    };
}

declare const window: TrustWindow;

export interface TrustWalletAdapterConfig {}

export const TrustWalletName = 'Trust' as WalletName<'Trust'>;

export class TrustWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = TrustWalletName;
    url = 'https://trustwallet.com';
    icon =
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIj48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6dXJsKCNsaW5lYXItZ3JhZGllbnQpO30uY2xzLTJ7ZmlsbDojMDUwMGZmO308L3N0eWxlPjxsaW5lYXJHcmFkaWVudCBpZD0ibGluZWFyLWdyYWRpZW50IiB4MT0iMTEyMy4yNiIgeTE9IjE4NjUuNzgiIHgyPSI5NTQuNjEiIHkyPSIxMzM3LjUiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAyMTgyKSBzY2FsZSgxIC0xKSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iLjAyIiBzdG9wLWNvbG9yPSJibHVlIi8+PHN0b3Agb2Zmc2V0PSIuMDgiIHN0b3AtY29sb3I9IiMwMDk0ZmYiLz48c3RvcCBvZmZzZXQ9Ii4xNiIgc3RvcC1jb2xvcj0iIzQ4ZmY5MSIvPjxzdG9wIG9mZnNldD0iLjQyIiBzdG9wLWNvbG9yPSIjMDA5NGZmIi8+PHN0b3Agb2Zmc2V0PSIuNjgiIHN0b3AtY29sb3I9IiMwMDM4ZmYiLz48c3RvcCBvZmZzZXQ9Ii45IiBzdG9wLWNvbG9yPSIjMDUwMGZmIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJtNzM4LjcxLDQyMy40MWwyMjEuNDUtNzIuM3Y1MDAuNTJjLTE1OC4xOC02Ni43NC0yMjEuNDUtMTk0LjY1LTIyMS40NS0yNjYuOTR2LTE2MS4yOFoiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Im0xMTgxLjYyLDQyMy40MWwtMjIxLjQ1LTcyLjN2NTAwLjUyYzE1OC4xOC02Ni43NCwyMjEuNDUtMTk0LjY1LDIyMS40NS0yNjYuOTR2LTE2MS4yOFoiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Im04MjUuOTEsMjMwLjg1aDMwLjl2MTcuMzFjMTAuMTMtMTUuNTYsMjEuNzgtMTcuMzEsMzguODQtMTcuMzF2MzAuNmgtNy43N2MtMjAuNDQsMC0zMC4yMyw5LjYyLTMwLjIzLDI4LjY3djMyLjUyaC0zMS43NXYtOTEuNzlaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJtOTk4Ljc4LDMyMi42M2gtMzEuNzV2LTguNzVjLTYuOTMsOC4wNS0xNi4zOCwxMS41NC0yOC4wMywxMS41NC0yMi4xMiwwLTM0LjYyLTEzLjExLTM0LjYyLTM3LjI0di01Ny4zNGgzMS43NXY1MC4xOGMwLDExLjM2LDUuNTcsMTgsMTUuMDIsMThzMTUuODgtNi40NywxNS44OC0xNy40OHYtNTAuN2gzMS43NXY5MS43OVoiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Im0xMDA2LjU0LDI5NC4zaDI5LjczYzEuMzYsNi42NCw1LjkxLDkuNDMsMTYuODgsOS40Myw4Ljk1LDAsMTQuMTktMi4wOSwxNC4xOS01Ljk0LDAtMi45OC0yLjU0LTQuOS05Ljc5LTYuNDdsLTIzLjk4LTUuNDJjLTE2LjA0LTMuNjYtMjQuMTUtMTIuOTMtMjQuMTUtMjcuOCwwLTE5LjU5LDE0LjM1LTI5LjczLDQyLjIxLTI5LjczczQxLjU0LDkuODgsNDMuOTEsMzEuMDRoLTI5LjU1Yy0uNS01LjU5LTYuMjUtOS4wMS0xNS43LTkuMDEtNy41OSwwLTEyLjQ5LDIuNDQtMTIuNDksNi4xMiwwLDMuMTQsMy4yLDUuNTksOS42Myw3LjE4bDI1LjE2LDYuMTJjMTYuNTQsNC4wMSwyNC40OSwxMi40MSwyNC40OSwyNi4wNSwwLDE4Ljg5LTE2LjM4LDMwLjA4LTQ0LjIzLDMwLjA4cy00Ni4yNy0xMi4wNi00Ni4yNy0zMS42NWgtLjAzWiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTExODEuNjIsMjU5LjR2LTI4LjU1aC03OC4zNXYyOC41NmgyMy4zOHY2My4yMmgzMS41OHYtNjMuMjRoMjMuMzlaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJtODE3LjA4LDI1OS40di0yOC41NWgtNzguMzV2MjguNTZoMjMuMzh2NjMuMjJoMzEuNTh2LTYzLjI0aDIzLjM4WiIvPjwvc3ZnPg==';
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: TrustWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: TrustWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.trustwallet?.solana?.isTrust) {
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
            const wallet = window.trustwallet!.solana!;

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

            try {
                const { signers, ...sendOptions } = options;

                transaction = await this.prepareTransaction(transaction, connection, sendOptions);

                signers?.length && transaction.partialSign(...signers);

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
