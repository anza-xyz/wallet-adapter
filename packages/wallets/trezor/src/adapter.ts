import type { WalletName } from '@solana/wallet-adapter-base';
import type { TrezorConnect } from '@trezor/connect-web';
import {
    BaseSignerWalletAdapter,
    WalletConfigError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignTransactionError,
    isVersionedTransaction,
} from '@solana/wallet-adapter-base';
import type { Transaction, TransactionVersion, VersionedTransaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { DEVICE, DEVICE_EVENT } from './constants.js';

export interface TrezorWalletAdapterConfig {
    derivationPath?: string;
    connectUrl?: string;
}

export const TrezorWalletName = 'Trezor' as WalletName<'Trezor'>;

export class TrezorWalletAdapter extends BaseSignerWalletAdapter {
    name = TrezorWalletName;
    url = 'https://trezor.io';
    icon =
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjEwOHB4IiBoZWlnaHQ9IjEwOHB4IiB2aWV3Qm94PSIwIDAgMTA4IDEwOCIgdmVyc2lvbj0iMS4xIj4NCjxnIGlkPSJzdXJmYWNlMSI+DQo8cGF0aCBzdHlsZT0iIHN0cm9rZTpub25lO2ZpbGwtcnVsZTpub256ZXJvO2ZpbGw6cmdiKDEwMCUsMTAwJSwxMDAlKTtmaWxsLW9wYWNpdHk6MTsiIGQ9Ik0gNTQgMCBDIDgzLjgyNDIxOSAwIDEwOCAyNC4xNzU3ODEgMTA4IDU0IEMgMTA4IDgzLjgyNDIxOSA4My44MjQyMTkgMTA4IDU0IDEwOCBDIDI0LjE3NTc4MSAxMDggMCA4My44MjQyMTkgMCA1NCBDIDAgMjQuMTc1NzgxIDI0LjE3NTc4MSAwIDU0IDAgWiBNIDU0IDAgIi8+DQo8cGF0aCBzdHlsZT0iIHN0cm9rZTpub25lO2ZpbGwtcnVsZTpub256ZXJvO2ZpbGw6cmdiKDAlLDAlLDAlKTtmaWxsLW9wYWNpdHk6MTsiIGQ9Ik0gNTQuMDQ2ODc1IDEwLjEyNSBDIDQxLjk0MTQwNiAxMC4xMjUgMzIuMTQwNjI1IDIwLjI0MjE4OCAzMi4xNDA2MjUgMzIuNzQyMTg4IEwgMzIuMTQwNjI1IDQxLjIxODc1IEMgMjcuODkwNjI1IDQyLjAxNTYyNSAyMy42MjUgNDMuMDc0MjE5IDIzLjYyNSA0NC40NDkyMTkgTCAyMy42MjUgODguNjg3NSBDIDIzLjYyNSA4OC42ODc1IDIzLjYyNSA4OS45MTAxNTYgMjQuOTU3MDMxIDkwLjQ4ODI4MSBDIDI5Ljc4MTI1IDkyLjUwNzgxMiA0OC43Njk1MzEgOTkuNDQ1MzEyIDUzLjEzMjgxMiAxMDEuMDM1MTU2IEMgNTMuNjk1MzEyIDEwMS4yNSA1My44NTE1NjIgMTAxLjI1IDU0IDEwMS4yNSBDIDU0LjIwNzAzMSAxMDEuMjUgNTQuMzA0Njg4IDEwMS4yNSA1NC44NjcxODggMTAxLjAzNTE1NiBDIDU5LjIzMDQ2OSA5OS40NDUzMTIgNzguMjY1NjI1IDkyLjUwNzgxMiA4My4wOTM3NSA5MC40ODgyODEgQyA4NC4zMjgxMjUgODkuOTYwOTM4IDg0LjM3NSA4OC43MzgyODEgODQuMzc1IDg4LjczODI4MSBMIDg0LjM3NSA0NC40NDkyMTkgQyA4NC4zNzUgNDMuMDc0MjE5IDgwLjE3MTg3NSA0MS45NjQ4NDQgNzUuOTA2MjUgNDEuMjE4NzUgTCA3NS45MDYyNSAzMi43NDIxODggQyA3NS45Njg3NSAyMC4yNDIxODggNjYuMTA5Mzc1IDEwLjEyNSA1NC4wNDY4NzUgMTAuMTI1IFogTSA1NC4wNDY4NzUgMjAuOTMzNTk0IEMgNjEuMTgzNTk0IDIwLjkzMzU5NCA2NS40OTYwOTQgMjUuMzg2NzE5IDY1LjQ5NjA5NCAzMi43NTM5MDYgTCA2NS40OTYwOTQgNDAuMTIxMDk0IEMgNTcuNDk2MDk0IDM5LjU0Mjk2OSA1MC42NjQwNjIgMzkuNTQyOTY5IDQyLjYxMzI4MSA0MC4xMjEwOTQgTCA0Mi42MTMyODEgMzIuNzUzOTA2IEMgNDIuNjEzMjgxIDI1LjM3NSA0Ni45MjU3ODEgMjAuOTMzNTk0IDU0LjA0Njg3NSAyMC45MzM1OTQgWiBNIDU0IDUwLjk2ODc1IEMgNjMuOTU3MDMxIDUwLjk2ODc1IDcyLjMxNjQwNiA1MS43NjU2MjUgNzIuMzE2NDA2IDUzLjE5MTQwNiBMIDcyLjMxNjQwNiA4MC43ODkwNjIgQyA3Mi4zMTY0MDYgODEuMjE4NzUgNzIuMjY1NjI1IDgxLjI2OTUzMSA3MS44OTg0MzggODEuNDIxODc1IEMgNzEuNTQ2ODc1IDgxLjU4NTkzOCA1NC45MTc5NjkgODcuNzc3MzQ0IDU0LjkxNzk2OSA4Ny43NzczNDQgQyA1NC45MTc5NjkgODcuNzc3MzQ0IDU0LjI0NjA5NCA4Ny45OTIxODggNTQuMDQ2ODc1IDg3Ljk5MjE4OCBDIDUzLjgzOTg0NCA4Ny45OTIxODggNTMuMTc5Njg4IDg3LjcyNjU2MiA1My4xNzk2ODggODcuNzI2NTYyIEMgNTMuMTc5Njg4IDg3LjcyNjU2MiAzNi41NTA3ODEgODEuNTM1MTU2IDM2LjE5OTIxOSA4MS4zNzEwOTQgQyAzNS44NDM3NSA4MS4yMDcwMzEgMzUuNzgxMjUgODEuMTU2MjUgMzUuNzgxMjUgODAuNzM4MjgxIEwgMzUuNzgxMjUgNTMuMTQwNjI1IEMgMzUuNjgzNTk0IDUxLjcxNDg0NCA0NC4wNDI5NjkgNTAuOTY4NzUgNTQgNTAuOTY4NzUgWiBNIDU0IDUwLjk2ODc1ICIvPg0KPC9nPg0KPC9zdmc+DQo=';
    supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0]);

    private _derivationPath: string;
    private _wallet: TrezorConnect | null;
    private _connectUrl?: string;
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
        this._connectUrl = config.connectUrl && config.connectUrl + (config.connectUrl.endsWith('/') ? '' : '/');
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

            try {
                const { default: TrezorConnect } = await import('@trezor/connect-web');
                // @ts-ignore
                this._wallet = TrezorConnect.default as TrezorConnect;
            } catch (error: any) {
                throw new WalletConfigError(error?.message, error);
            }

            await this._wallet.init({
                manifest: {
                    email: 'maintainers@solana.foundation',
                    appUrl: 'https://github.com/solana-labs/wallet-adapter',
                },
                lazyLoad: true,
                ...(this._connectUrl
                    ? {
                          connectSrc: this._connectUrl,
                          iframeSrc: this._connectUrl,
                      }
                    : {}),
            });

            let result;
            try {
                result = await this._wallet.solanaGetPublicKey({
                    path: this._derivationPath,
                });
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            if (!result.success) {
                throw new WalletPublicKeyError(result.payload?.error, result.payload);
            }

            const publicKey = result.payload.publicKey;

            this._wallet.on(DEVICE_EVENT, (event: any) => {
                if (event.type === DEVICE.DISCONNECT) {
                    this._disconnected();
                }
            });

            this._publicKey = new PublicKey(Buffer.from(publicKey, 'hex'));

            this.emit('connect', this._publicKey);
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        this._publicKey = null;

        try {
            await this._wallet?.dispose();
        } catch (error: any) {
            this.emit('error', new WalletDisconnectionError(error?.message, error));
        }

        this.emit('disconnect');
    }

    async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
        try {
            const wallet = this._wallet;
            const publicKey = this._publicKey;
            if (!wallet || !publicKey) throw new WalletNotConnectedError();

            const serializedTransaction = isVersionedTransaction(transaction)
                ? transaction.message.serialize()
                : transaction.serializeMessage();

            let result;
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

            transaction.addSignature(publicKey, Buffer.from(result.payload.signature, 'hex'));

            return transaction;
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    private _disconnected = () => {
        this._wallet?.dispose();
        this._publicKey = null;

        this.emit('error', new WalletDisconnectedError());
        this.emit('disconnect');
    };
}
