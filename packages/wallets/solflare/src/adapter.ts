import type { WalletAdapterNetwork, WalletName } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    WalletConfigError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletError,
    WalletLoadError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSendTransactionError,
    WalletSignMessageError,
    WalletSignTransactionError,
    isIosAndRedirectable,
    isVersionedTransaction,
    scopePollingDetectionStrategy,
    type SendTransactionOptions,
} from '@solana/wallet-adapter-base';
import type { Transaction, TransactionVersion, VersionedTransaction } from '@solana/web3.js';
import { PublicKey, type Connection, type TransactionSignature } from '@solana/web3.js';
import type { default as Solflare } from '@solflare-wallet/sdk';
import { detectAndRegisterSolflareMetaMaskWallet } from './metamask/detect.js';

interface SolflareWindow extends Window {
    solflare?: {
        isSolflare?: boolean;
    };
    SolflareApp?: unknown;
}

declare const window: SolflareWindow;

export interface SolflareWalletAdapterConfig {
    network?: WalletAdapterNetwork;
}

export const SolflareWalletName = 'Solflare' as WalletName<'Solflare'>;

export class SolflareWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = SolflareWalletName;
    url = 'https://solflare.com';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjkwIiBoZWlnaHQ9IjI5MCIgdmlld0JveD0iMCAwIDI5MCAyOTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8xNDZfMjk5KSI+CjxwYXRoIGQ9Ik02My4yOTUxIDFIMjI2LjcwNUMyNjEuMTEgMSAyODkgMjguODkwNSAyODkgNjMuMjk1MVYyMjYuNzA1QzI4OSAyNjEuMTEgMjYxLjExIDI4OSAyMjYuNzA1IDI4OUg2My4yOTUxQzI4Ljg5MDUgMjg5IDEgMjYxLjExIDEgMjI2LjcwNVY2My4yOTUxQzEgMjguODkwNSAyOC44OTA1IDEgNjMuMjk1MSAxWiIgZmlsbD0iI0ZGRUY0NiIgc3Ryb2tlPSIjRUVEQTBGIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTE0MC41NDggMTUzLjIzMUwxNTQuODMyIDEzOS40MzJMMTgxLjQ2MiAxNDguMTQ3QzE5OC44OTMgMTUzLjk1OCAyMDcuNjA5IDE2NC42MSAyMDcuNjA5IDE3OS42MkMyMDcuNjA5IDE5MC45OTkgMjAzLjI1MSAxOTguNTA0IDE5NC41MzYgMjA4LjE4OEwxOTEuODczIDIxMS4wOTNMMTkyLjg0MSAyMDQuMzE0QzE5Ni43MTQgMTc5LjYyIDE4OS40NTIgMTY4Ljk2OCAxNjUuNDg0IDE2MS4yMkwxNDAuNTQ4IDE1My4yMzFaTTEwNC43MTcgNjguNzM5TDE3Ny4zNDcgOTIuOTQ4OEwxNjEuNjEgMTA3Ljk1OUwxMjMuODQzIDk1LjM2OThDMTEwLjc3IDkxLjAxMiAxMDYuNDEyIDgzLjk5MTEgMTA0LjcxNyA2OS4yMjMyVjY4LjczOVpNMTAwLjM1OSAxOTEuNzI1TDExNi44MjIgMTc1Ljk4OEwxNDcuODExIDE4Ni4xNTdDMTY0LjAzMSAxOTEuNDgzIDE2OS41OTkgMTk4LjUwNCAxNjcuOTA1IDIxNi4xNzdMMTAwLjM1OSAxOTEuNzI1Wk03OS41MzkgMTIxLjUxNkM3OS41MzkgMTE2LjkxNyA4MS45NTk5IDExMi41NTkgODYuMDc1NiAxMDguOTI3QzkwLjQzMzQgMTE1LjIyMiA5Ny45Mzg0IDEyMC43OSAxMDkuODAxIDEyNC42NjRMMTM1LjQ2NCAxMzMuMTM3TDEyMS4xOCAxNDYuOTM3TDk2LjAwMTYgMTM4LjcwNUM4NC4zODA5IDEzNC44MzIgNzkuNTM5IDEyOS4wMjEgNzkuNTM5IDEyMS41MTZaTTE1NS41NTggMjQ4LjYxOEMyMDguODE5IDIxMy4yNzIgMjM3LjM4NyAxODkuMzA0IDIzNy4zODcgMTU5Ljc2OEMyMzcuMzg3IDE0MC4xNTggMjI1Ljc2NiAxMjkuMjYzIDIwMC4xMDQgMTIwLjc5TDE4MC43MzYgMTE0LjI1M0wyMzMuNzU2IDYzLjQxMjhMMjIzLjEwMyA1Mi4wMzQyTDIwNy4zNjcgNjUuODMzN0wxMzMuMDQzIDQxLjM4MThDMTEwLjA0MyA0OC44ODY5IDgwLjk5MTYgNzAuOTE3OCA4MC45OTE2IDkyLjk0ODdDODAuOTkxNiA5NS4zNjk3IDgxLjIzMzcgOTcuNzkwNyA4MS45NiAxMDAuNDU0QzYyLjgzNDIgMTExLjM0OCA1NS4wODcxIDEyMS41MTYgNTUuMDg3MSAxMzQuMTA1QzU1LjA4NzEgMTQ1Ljk2OCA2MS4zODE2IDE1Ny44MzEgODEuNDc1OCAxNjQuMzY4TDk3LjQ1NDIgMTY5LjY5NEw0Mi4yNTU5IDIyMi43MTNMNTIuOTA4MiAyMzQuMDkyTDcwLjA5NzIgMjE4LjM1NkwxNTUuNTU4IDI0OC42MThaIiBmaWxsPSIjMDIwNTBBIi8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfMTQ2XzI5OSI+CjxyZWN0IHdpZHRoPSIyOTAiIGhlaWdodD0iMjkwIiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=';
    supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0]);

    private _connecting: boolean;
    private _wallet: Solflare | null;
    private _publicKey: PublicKey | null;
    private _config: SolflareWalletAdapterConfig;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.Loadable;

    constructor(config: SolflareWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._publicKey = null;
        this._wallet = null;
        this._config = config;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.solflare?.isSolflare || window.SolflareApp) {
                    this._readyState = WalletReadyState.Installed;
                    this.emit('readyStateChange', this._readyState);
                    return true;
                }
                return false;
            });
            detectAndRegisterSolflareMetaMaskWallet();
        }
    }

    get publicKey() {
        return this._publicKey;
    }

    get connecting() {
        return this._connecting;
    }

    get connected() {
        return !!this._wallet?.connected;
    }

    get readyState() {
        return this._readyState;
    }

    async autoConnect(): Promise<void> {
        // Skip autoconnect in the Loadable state on iOS
        // We can't redirect to a universal link without user input
        if (!(this.readyState === WalletReadyState.Loadable && isIosAndRedirectable())) {
            await this.connect();
        }
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Loadable && this._readyState !== WalletReadyState.Installed)
                throw new WalletNotReadyError();

            // redirect to the Solflare /browse universal link
            // this will open the current URL in the Solflare in-wallet browser
            if (this.readyState === WalletReadyState.Loadable && isIosAndRedirectable()) {
                const url = encodeURIComponent(window.location.href);
                const ref = encodeURIComponent(window.location.origin);
                window.location.href = `https://solflare.com/ul/v1/browse/${url}?ref=${ref}`;
                return;
            }

            let SolflareClass: typeof Solflare;
            try {
                SolflareClass = (await import('@solflare-wallet/sdk')).default;
            } catch (error: any) {
                throw new WalletLoadError(error?.message, error);
            }

            let wallet: Solflare;
            try {
                wallet = new SolflareClass({ network: this._config.network });
            } catch (error: any) {
                throw new WalletConfigError(error?.message, error);
            }

            this._connecting = true;

            if (!wallet.connected) {
                try {
                    await wallet.connect();
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
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

                return await wallet.signAndSendTransaction(transaction, sendOptions);
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
                return ((await wallet.signTransaction(transaction)) as T) || transaction;
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
                return await wallet.signMessage(message, 'utf8');
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

    private _accountChanged = (newPublicKey?: PublicKey) => {
        if (!newPublicKey) return;

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
