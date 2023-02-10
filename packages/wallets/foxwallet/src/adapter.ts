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

interface FoxWalletWallet {
    isFoxWallet?: boolean;
    isConnected: boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getAccount(): Promise<string>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
}

interface FoxWalletWindow extends Window {
    foxwallet?: {
        solana?: FoxWalletWallet;
    };
}

declare const window: FoxWalletWindow;

export interface FoxWalletWalletAdapterConfig {}

export const FoxWalletWalletName = 'FoxWallet' as WalletName<'FoxWallet'>;

export class FoxWalletWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = FoxWalletWalletName;
    url = 'https://foxwallet.com';
    icon =
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI1LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9ImZveHdhbGxldCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCgkgdmlld0JveD0iMCAwIDEyMDAgMTIwMCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTIwMCAxMjAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO2ZpbGw6I0ZGRkZGRjt9Cgkuc3Qxe2ZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO2ZpbGw6dXJsKCNTVkdJRF8xXyk7fQoJLnN0MntmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtmaWxsOnVybCgjU1ZHSURfMl8pO30KCS5zdDN7ZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7ZmlsbDp1cmwoI1NWR0lEXzNfKTt9Cgkuc3Q0e2ZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO2ZpbGw6dXJsKCNTVkdJRF80Xyk7fQoJLnN0NXtmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtmaWxsOnVybCgjU1ZHSURfNV8pO30KCS5zdDZ7ZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7ZmlsbDojNzIyQjAwO30KCS5zdDd7ZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7ZmlsbDp1cmwoI1NWR0lEXzZfKTt9Cjwvc3R5bGU+CjxnPgoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTQ4NS43LDY3Ny40YzIuNSwwLjgsNS4xLDEuNCw3LjcsMS43YzAsMC0xMC45LDQuMS0zMy40LTMuNmMwLDAtMTYuOS02LjktMjkuNS01LjcKCQljLTE0LjcsMS4zLTI0LjgsMjAuNC0yNC44LDIwLjRjMi45LTEuNiw2LTIuOCw5LjItMy42YzEwLTIsNi42LTAuMyw2LjYtMC4zcy0xOS4yLDguMS0yMC41LDE1LjJjLTAuMywxLjgsNS4xLTMuMywxOS4zLTIuOAoJCWMxNy41LDAuNSwzMi43LDEwLjcsMzguOSwxMi40YzEyLjgsMy40LDMxLjEsNC4yLDQ4LTljMCwwLDE1LjUtOS43LDIwLjMtMjcuN2MxLjItNSwyLTEwLjEsMi4yLTE1LjJjMC4xLTQuNS0wLjQtOS0xLjQtMTMuNQoJCUM1MjguMiw2NDUuNiw1MTkuMSw2NjYuNyw0ODUuNyw2NzcuNHoiLz4KCgkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8xXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI2MTYuMjE1MSIgeTE9Ijc0Ni4yNjQzIiB4Mj0iNjMzLjU3ODciIHkyPSIzMTUuMzk3OSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDEyMDIpIj4KCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojREFEQjQ4Ii8+CgkJPHN0b3AgIG9mZnNldD0iMC42NTYyIiBzdHlsZT0ic3RvcC1jb2xvcjojNjM3NjIxIi8+Cgk8L2xpbmVhckdyYWRpZW50PgoJPHBhdGggY2xhc3M9InN0MSIgZD0iTTgxNi4xLDg3NC45YzMzLjktNDIuNSw1Mi4zLTk1LjIsNTIuMy0xNDkuNmMwLTU0LjMtMTguNS0xMDcuMS01Mi4zLTE0OS42bDIxNy4xLTIzLjljMCwwLDIyLjYsNjEuOSwyOC41LDk1CgkJYzAuOCw0LjIsMi4xLDEyLjgsMi4xLDEyLjhzLTMzLjcsODEuOC04NS40LDEyNi43QzkwOSw4NDYuNyw4MTYuMSw4NzQuOSw4MTYuMSw4NzQuOXogTTMwMiw4NzEuOWwtODMuMiwxNS40CgkJYy0yNi40LTY2LjktMzYuMS0xMzkuMi0yOC4xLTIxMC42YzcuOS03MS41LDMzLjMtMTM5LjksNzMuNy0xOTkuM2MxLjgtMi42LDUuNC03LjcsNS40LTcuN2w5MS45LDI1OC45TDMwMiw4NzEuOXoiLz4KCgkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8yXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI2MjYuMjQ4IiB5MT0iOTcwLjIzNzEiIHgyPSI0MTUuMTU0MyIgeTI9Ijk3MC4yMzcxIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIC0xIDAgMTIwMikiPgoJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNFQzZGMDEiLz4KCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojRjRCMjNEIi8+Cgk8L2xpbmVhckdyYWRpZW50PgoJPHBhdGggY2xhc3M9InN0MiIgZD0iTTYwMy4xLDM0MC45YzAuMy0wLjQsMC41LTAuNSwwLjgtMC45YzIuMi0yLjQsNTMuOS01Ny45LTcuNy0xNTJjLTQ1LjUtNjkuMy0xNjEuMi02Ny40LTIwOC41LTEwMy41CgkJYzMuNSwyNy44LDMwLjcsNTIuOSwyNy44LDkwLjljLTEuMiwxMi42LTMuNSwyNS03LDM3LjFjLTUuNiwyMS43LTEwLjgsNDIuNC0zLDgyLjljNi4xLDMxLjYsMjAuNSw1NC42LDQyLjgsNjguNQoJCWMyNS42LDE1LjgsNjEsMTkuMyw5Ny4zLDkuNUM1NjkuOCwzNjYuOCw1OTEuNCwzNTQuNiw2MDMuMSwzNDAuOUw2MDMuMSwzNDAuOXoiLz4KCgkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8zXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI2MDkuMTIyMSIgeTE9IjkzNC43NDkiIHgyPSI1OTYuNjQ0MSIgeTI9IjExMzguNTYzNSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDEyMDIpIj4KCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojRjRCMzNFIi8+CgkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6I0ZCNkYxQiIvPgoJPC9saW5lYXJHcmFkaWVudD4KCTxwYXRoIGNsYXNzPSJzdDMiIGQ9Ik02ODAuMiwzMDAuM2MxMy4zLTIyLjksMTUuOC00OS42LDcuNi03OS4yYy0xMS40LTQxLjQtMzMtNjguNi01MC41LTkwLjRjLTUuNS02LjktMTAuNi0xMy4zLTE0LjgtMTkuNAoJCWMtMTYuNi0yNC40LTIzLjgtNTQtMjAuMi04My4yYy0yMS4xLDE1LjItNjEuNyw0My44LTg3LjYsNzQuM2MzNy41LDE4LDY2LjgsMzcuNiw4OS45LDcyLjljMzkuNSw2MC4yLDM4LjgsMTA4LjgsMzEuMywxMzkKCQljLTIuMSw4LjMsMTMuOCwxNS43LDEwLjksMjIuMUM2NjAuMywzMjYuOCw2NzEuNiwzMTQuNSw2ODAuMiwzMDAuM3oiLz4KCgkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF80XyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIyMzEuMDYzMyIgeTE9Ijc0My41NDg2IiB4Mj0iOTczLjUyOTIiIHkyPSI0NTAuMzA1MyIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDEyMDIpIj4KCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojRkI2RDFBIi8+CgkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6I0YzQjIzRSIvPgoJPC9saW5lYXJHcmFkaWVudD4KCTxwYXRoIGNsYXNzPSJzdDQiIGQ9Ik05NjcuNyw1NTAuM2MtNDQuMS00LjItMTMzLjQtMTUuMS0xMzMuNC0xNS4xYy0yMDAuOS0xMS4yLTMxNC45LDQ5LjEtNDAwLjksMTI4Yy02Ni40LDY2LTEyNS42LDIzNy0xMjUuNiwyMzcKCQlsLTcxLjktMy45YzAsMCwyMi45LTY4LjIsNDkuNC0xMTcuOWMzMC40LTU2LjksMzcuMi01Mi4zLDMwLjMtNjEuN2MtMzIuMS00NC4xLTQ3LjItNzguOC02MC4xLTE1M2MwLDAsMTUuMSwxMS45LDI2LjUsNC42CgkJYzAsMC0yNS45LTQ1LTI5LjktOTMuNmMtNy4xLTg2LjEsMzMuMi0yMDMuNywzNC4yLTIwNi40Yy0wLjQsMS4yLTIuNSwxMS4zLDIxLjEsMjYuNGMxLjctNy4xLDMuNS0xNC4xLDUuNC0yMC45CgkJYzguMy00MC42LDMwLjYtMTI5LjMsNzUuMS0xODkuNGMwLDAsMjQuOSw4Ni45LDg3LjQsMTI2LjNjMTIxLjcsNzYuOCwxOTcuOSw3Ny4yLDE5Ny45LDc3LjJjMTcxLjksMTkuMiwyNDUuMywxMDMuNiwyNDUuMywxMDMuNgoJCUMxMDQxLjksNTI0LjYsMTE1NCw1MjMuNCwxMTU0LDUyMy40QzExMTMuNyw1NjEuOSw5NjcuNyw1NTAuMyw5NjcuNyw1NTAuM3ogTTI4Ni4yLDI2OC4zYzAsMCwwLTAuMSwwLTAuMUwyODYuMiwyNjguM3oiLz4KCgkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF81XyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIzOTcuNDM0OCIgeTE9IjMxNC44MjYxIiB4Mj0iMTEwMi40NjUyIiB5Mj0iNjI0LjcwNjYiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCAxMjAyKSI+CgkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0YzQjYzRiIvPgoJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiNGQjcwMUMiLz4KCTwvbGluZWFyR3JhZGllbnQ+Cgk8cGF0aCBjbGFzcz0ic3Q1IiBkPSJNMTE1Ni4xLDUyMy40YzAsMC0xNy41LDk2LjgtMTA5LjIsMTA4LjFjMCwwLTMzMi42LTIuMS0zNTYuOSwzMDBsLTUuNiw4NC45bC0zOTktMTE2LjMKCQljMCwwLDM3LjYtMTI4LjMsMTE5LjktMjMxLjNjMCwwLDEzOS43LTE5Ny4zLDUzNy43LTE0NS4zYzAsMCw0Ni41LDkuNCwxMTEuNywxNS41QzExMDkuNyw1NDQuMSwxMTU2LjEsNTIzLjQsMTE1Ni4xLDUyMy40eiIvPgoJPHBhdGggY2xhc3M9InN0NiIgZD0iTTkyOS44LDQ3Ny4zYzAsMC04Ni40LTQ0LjktMTkzLjktNDAuN2MwLDAsNTguNS00NS43LDEzNy41LTM0LjVMOTI5LjgsNDc3LjN6Ii8+CgoJCTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfNl8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iMzI0Ljc0IiB5MT0iODYuNzMzMyIgeDI9IjkzNS4xNDM4IiB5Mj0iNDY3LjMyNjYiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCAxMjAyKSI+CgkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0VDNkYwMCIvPgoJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiNGNEIzM0UiLz4KCTwvbGluZWFyR3JhZGllbnQ+Cgk8cGF0aCBjbGFzcz0ic3Q3IiBkPSJNNzExLjMsODkwLjFjMCwwLDI4LjEsMTkuNCw3Mi43LDkuMWMwLDAtNzIuMSw0MS44LTIyNC4xLTE1LjVjMCwwLTE1Ni43LTcwLjEtMjY3LTU0LjEKCQljLTcwLjksMTAuMy0xMzMuNSw2Ni42LTE3MS41LDEwOS40Yy00NS44LDUxLjgtNDAuMSwyNy42LDc1LDEzLjNjMjcuNy0zLjQsMTEuNyw0LjQsMTEuNyw0LjRTNTQuNCwxMDIxLjIsNDQsMTA3OC41CgkJYy0yLjYsMTQuMyw0MC41LTI2LjEsMTU0LjItMjIuNWMxMzkuNiw0LjQsMjYxLDg1LjQsMzEwLjksOTguOGMxMDIuMiwyNy4zLDI0OC44LDMzLjYsMzgzLjMtNzEuOWMwLDAsMTI0LjEtNzcuOSwxNjIuNS0yMjEuOAoJCWMxMC0zOS45LDE1LjktODAuOCwxNy42LTEyMS45YzItNTMuNi0xNC4zLTExMC0xNC4zLTExMFM5NjcuNiw4MzAuMyw3MTEuMyw4OTAuMXoiLz4KPC9nPgo8L3N2Zz4K';
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: FoxWalletWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: FoxWalletWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.foxwallet?.solana?.isFoxWallet) {
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
            const wallet = window.foxwallet!.solana!;

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
