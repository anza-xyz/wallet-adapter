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
        'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjEwOCIgd2lkdGg9IjEwOCIgdmlld0JveD0iMCAwIDEwOCAxMDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTU0IDBjMjkuODI0MjE5IDAgNTQgMjQuMTc1NzgxIDU0IDU0cy0yNC4xNzU3ODEgNTQtNTQgNTQtNTQtMjQuMTc1NzgxLTU0LTU0IDI0LjE3NTc4MS01NCA1NC01NHptMCAwIiBmaWxsPSIjZmZmIi8+PHBhdGggZD0ibTU0LjA0Njg3NSAxMC4xMjVjLTEyLjEwNTQ2OSAwLTIxLjkwNjI1IDEwLjExNzE4OC0yMS45MDYyNSAyMi42MTcxODh2OC40NzY1NjJjLTQuMjUuNzk2ODc1LTguNTE1NjI1IDEuODU1NDY5LTguNTE1NjI1IDMuMjMwNDY5djQ0LjIzODI4MXMwIDEuMjIyNjU2IDEuMzMyMDMxIDEuODAwNzgxYzQuODI0MjE5IDIuMDE5NTMxIDIzLjgxMjUgOC45NTcwMzEgMjguMTc1NzgxIDEwLjU0Njg3NS41NjI1LjIxNDg0NC43MTg3NS4yMTQ4NDQuODY3MTg4LjIxNDg0NC4yMDcwMzEgMCAuMzA0Njg4IDAgLjg2NzE4OC0uMjE0ODQ0IDQuMzYzMjgxLTEuNTg5ODQ0IDIzLjM5ODQzNy04LjUyNzM0NCAyOC4yMjY1NjItMTAuNTQ2ODc1IDEuMjM0Mzc1LS41MjczNDMgMS4yODEyNS0xLjc1IDEuMjgxMjUtMS43NXYtNDQuMjg5MDYyYzAtMS4zNzUtNC4yMDMxMjUtMi40ODQzNzUtOC40Njg3NS0zLjIzMDQ2OXYtOC40NzY1NjJjLjA2MjUtMTIuNS05Ljc5Njg3NS0yMi42MTcxODgtMjEuODU5Mzc1LTIyLjYxNzE4OHptMCAxMC44MDg1OTRjNy4xMzY3MTkgMCAxMS40NDkyMTkgNC40NTMxMjUgMTEuNDQ5MjE5IDExLjgyMDMxMnY3LjM2NzE4OGMtOC0uNTc4MTI1LTE0LjgzMjAzMi0uNTc4MTI1LTIyLjg4MjgxMyAwdi03LjM2NzE4OGMwLTcuMzc4OTA2IDQuMzEyNS0xMS44MjAzMTIgMTEuNDMzNTk0LTExLjgyMDMxMnptLS4wNDY4NzUgMzAuMDM1MTU2YzkuOTU3MDMxIDAgMTguMzE2NDA2Ljc5Njg3NSAxOC4zMTY0MDYgMi4yMjI2NTZ2MjcuNTk3NjU2YzAgLjQyOTY4OC0uMDUwNzgxLjQ4MDQ2OS0uNDE3OTY4LjYzMjgxMy0uMzUxNTYzLjE2NDA2My0xNi45ODA0NjkgNi4zNTU0NjktMTYuOTgwNDY5IDYuMzU1NDY5cy0uNjcxODc1LjIxNDg0NC0uODcxMDk0LjIxNDg0NGMtLjIwNzAzMSAwLS44NjcxODctLjI2NTYyNi0uODY3MTg3LS4yNjU2MjZzLTE2LjYyODkwNy02LjE5MTQwNi0xNi45ODA0NjktNi4zNTU0NjhjLS4zNTU0NjktLjE2NDA2My0uNDE3OTY5LS4yMTQ4NDQtLjQxNzk2OS0uNjMyODEzdi0yNy41OTc2NTZjLS4wOTc2NTYtMS40MjU3ODEgOC4yNjE3MTktMi4xNzE4NzUgMTguMjE4NzUtMi4xNzE4NzV6bTAgMCIvPjwvc3ZnPg==';
    supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0]);

    private _derivationPath: string;
    private _wallet: TrezorConnect | null;
    private _connectUrl: string | undefined;
    private _connecting: boolean;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' ||
        typeof document === 'undefined' ||
        typeof navigator === 'undefined' ||
        !navigator.hid
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
