import type { WalletName } from '@solana/wallet-adapter-base';
import {
    BaseSignerWalletAdapter,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type { Transaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

interface SafePalWallet {
    isSafePalWallet?: boolean;
    getAccount(): Promise<string>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}

interface SafePalWalletWindow extends Window {
    safepal?: SafePalWallet;
}

declare const window: SafePalWalletWindow;

export interface SafePalWalletAdapterConfig {}

export const SafePalWalletName = 'SafePal' as WalletName<'SafePal'>;

export class SafePalWalletAdapter extends BaseSignerWalletAdapter {
    name = SafePalWalletName;
    url = 'https://safepal.io';
    icon =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAP1BMVEUAAABKIe9MIO9LIO9KIe5KIO9KIe9KIO5JIO1KIu1KIO1KIe////+kkPfo4/1hPfFgPfGZgvaOdPWDZvRVL/CpQHckAAAAC3RSTlMA7yC/oDDfgJCQkAOmnXUAAADnSURBVEjHlZbtjoJAEAR7BwTvmvUO9f2f1USNk81MRrp+VxFY9gsvbJ0aC9r0Y3Bs5gHmT3JqPMRy0nyyPQtbeJhmAGYKzIBRwvBLiRUTJSY0SjQw4X7tI//8kAV/l22k04HoE6JPiD4h+oToE8HfWYLwfNZg9EOQvpL7Mag+et+SoBrWWxaUP64nQT01ehLUk6/nwXYLgRdpsIfAiyy4VAuoc8B9D0rcPxbs7sfAB8oJPiH6hOgTok+IPiH4YQH1keudCfJmrG/3KyXO8pGlH4ow4bMX0w/2Z7EIvnY5cez87fqzvvUH/qNgaUlN588AAAAASUVORK5CYII=';
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: SafePalWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: SafePalWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.safepal?.isSafePalWallet) {
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
            const wallet = window.safepal!;

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
        if (this._wallet) {
            this._wallet = null;
            this._publicKey = null;
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
}
