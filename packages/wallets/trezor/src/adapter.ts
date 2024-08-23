import type { WalletName } from '@solana/wallet-adapter-base';
import {
    BaseSignerWalletAdapter,
    WalletAccountError,
    WalletConfigError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletLoadError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignTransactionError,
    isVersionedTransaction,
} from '@solana/wallet-adapter-base';
import type { Transaction, TransactionVersion, VersionedTransaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import type {
    DeviceEventMessage,
    SolanaPublicKey,
    SolanaSignedTransaction,
    Success,
    TrezorConnect,
    Unsuccessful,
} from '@trezor/connect-web';
import './polyfills/index.js';

export interface TrezorWalletAdapterConfig {
    derivationPath?: string;
    connectUrl?: string;
}

export const TrezorWalletName = 'Trezor' as WalletName<'Trezor'>;

export class TrezorWalletAdapter extends BaseSignerWalletAdapter {
    name = TrezorWalletName;
    url = 'https://trezor.io';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA4IiBoZWlnaHQ9IjEwOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBjbGlwLXBhdGg9InVybCgjYSkiPjxwYXRoIGQ9Ik01NCAwYzI5LjgyNCAwIDU0IDI0LjE3NiA1NCA1NHMtMjQuMTc2IDU0LTU0IDU0UzAgODMuODI0IDAgNTQgMjQuMTc2IDAgNTQgMHoiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNNzUuMjUgMzMuMzA1Qzc1LjI1IDIyLjIwNSA2NS42NjIgMTMgNTQgMTNjLTExLjY3MiAwLTIxLjI1OCA5LjIxMi0yMS4yNTggMjAuMzA1djYuNDlIMjR2NDYuNjgzTDUzLjk5IDEwMC41IDg0IDg2LjQ3NXYtNDYuNDdoLTguNzQ1bC0uMDA3LTYuNjk4LjAwMi0uMDAyem0tMzEuNjcgMGMwLTUuMjMyIDQuNTg1LTkuNDIgMTAuNDE4LTkuNDIgNS44MzUgMCAxMC40MTcgNC4xODggMTAuNDE3IDkuNDJ2Ni40OUg0My41OHYtNi40OXptMjguMzM1IDQ1LjYzN0w1My45OSA4Ny4zMmwtMTcuOTItOC4zNzJWNTAuODloMzUuODQ1djI4LjA1MnoiIGZpbGw9IiMxNzE3MTciLz48L2c+PGRlZnM+PGNsaXBQYXRoIGlkPSJhIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMCAwaDEwOHYxMDhIMHoiLz48L2NsaXBQYXRoPjwvZGVmcz48L3N2Zz4=';
    supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0]);

    private _derivationPath: string;
    private _wallet: TrezorConnect | null;
    private _connectUrl: string | undefined;
    private _connecting: boolean;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.Loadable;

    constructor(config: TrezorWalletAdapterConfig = {}) {
        super();
        this._derivationPath = config.derivationPath || `m/44'/501'/0'/0'`;
        this._wallet = null;
        this._connectUrl = config.connectUrl?.replace(/\/*$/, '/');
        this._connecting = false;
        this._publicKey = null;
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
            if (this._readyState !== WalletReadyState.Loadable) throw new WalletNotReadyError();

            this._connecting = true;

            let wallet: TrezorConnect;
            try {
                const { default: TrezorConnect } = await import('@trezor/connect-web');
                // @ts-expect-error // HACK: TrezorConnect.default is undefined.
                wallet = TrezorConnect.default as TrezorConnect;
            } catch (error: any) {
                throw new WalletLoadError(error?.message, error);
            }

            try {
                await wallet.init({
                    manifest: {
                        email: 'gabriel.kerekes@vacuumlabs.com',
                        appUrl: window.location.href,
                    },
                    lazyLoad: true,
                    ...(this._connectUrl
                        ? {
                              connectSrc: this._connectUrl,
                              iframeSrc: this._connectUrl,
                          }
                        : {}),
                });
            } catch (error: any) {
                throw new WalletConfigError(error?.message, error);
            }

            let result: Unsuccessful | Success<SolanaPublicKey>;
            try {
                result = await wallet.solanaGetPublicKey({ path: this._derivationPath });
            } catch (error: any) {
                throw new WalletAccountError(error?.message, error);
            }
            if (!result.success) {
                throw new WalletAccountError(result.payload?.error, result.payload);
            }

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(Buffer.from(result.payload.publicKey, 'hex'));
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            wallet.on('DEVICE_EVENT', this._onDeviceEvent);

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
                wallet.off('DEVICE_EVENT', this._onDeviceEvent);
                await wallet.dispose();
            } catch (error: any) {
                this.emit('error', new WalletDisconnectionError(error?.message, error));
            }

            this.emit('disconnect');
        }
    }

    async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
        try {
            const wallet = this._wallet;
            const publicKey = this._publicKey;
            if (!wallet || !publicKey) throw new WalletNotConnectedError();

            const serializedTransaction = isVersionedTransaction(transaction)
                ? transaction.message.serialize()
                : transaction.serializeMessage();

            let result: Unsuccessful | Success<SolanaSignedTransaction>;
            try {
                result = await wallet.solanaSignTransaction({
                    path: this._derivationPath,
                    serializedTx: Buffer.from(serializedTransaction).toString('hex'),
                });
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }

            if (!result.success) {
                throw new WalletSignTransactionError(result.payload?.error, result.payload);
            }

            try {
                const signature = Buffer.from(result.payload.signature, 'hex');
                transaction.addSignature(publicKey, signature);
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }

            return transaction;
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    private _onDeviceEvent = (event: DeviceEventMessage) => {
        if (event.type === 'device-disconnect') {
            this._disconnected();
        }
    };

    private _disconnected = async () => {
        const wallet = this._wallet;
        if (wallet) {
            this._wallet = null;
            this._publicKey = null;

            try {
                wallet.off('DEVICE_EVENT', this._onDeviceEvent);
                wallet.dispose();
            } catch (error: any) {
                this.emit('error', new WalletDisconnectionError(error?.message, error));
            }

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };
}
