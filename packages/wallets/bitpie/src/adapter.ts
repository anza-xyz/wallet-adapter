import {
    Adapter,
    BaseSignerWalletAdapter,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletName,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';

interface BitpieWallet {
    getAccount(): Promise<string>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}

interface BitpieWalletWindow extends Window {
    bitpie?: BitpieWallet;
}

declare const window: BitpieWalletWindow;

export interface BitpieWalletAdapterConfig {}

export const BitpieWalletName = 'Bitpie' as WalletName;

export class BitpieWalletAdapter extends BaseSignerWalletAdapter {
    name = BitpieWalletName;
    url = 'https://bitpiecn.com';
    icon = `data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjY0IiB2aWV3Qm94PSIwIDAgNjQgNjQiIHdpZHRoPSI2NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGxpbmVhckdyYWRpZW50IGlkPSJhIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMxZTNkYTAiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMzNzUwZGUiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iYiIgeDE9IjUyLjU0NTc1JSIgeDI9IjUyLjU0NTc1JSIgeGxpbms6aHJlZj0iI2EiIHkxPSIxMDAlIiB5Mj0iMCUiLz48bGluZWFyR3JhZGllbnQgaWQ9ImMiIHgxPSI1MCUiIHgyPSI1MCUiIHkxPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzFkM2JhMyIgc3RvcC1vcGFjaXR5PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMTczNzkzIiBzdG9wLW9wYWNpdHk9Ii42NTI5MzgiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iZCIgeDE9IjUwJSIgeDI9IjUwJSIgeGxpbms6aHJlZj0iI2EiIHkxPSIxMDAlIiB5Mj0iMCUiLz48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Im0xOCAwaDI4YzkuOTQxMTI1NSAwIDE4IDguMDU4ODc0NSAxOCAxOHYyOGMwIDkuOTQxMTI1NS04LjA1ODg3NDUgMTgtMTggMThoLTI4Yy05Ljk0MTEyNTUgMC0xOC04LjA1ODg3NDUtMTgtMTh2LTI4YzAtOS45NDExMjU1IDguMDU4ODc0NS0xOCAxOC0xOHoiIGZpbGw9InVybCgjYikiLz48Y2lyY2xlIGN4PSIzMi4yODU3MTQiIGN5PSIzMi4yODU3MTQiIGZpbGw9IiNmZmYiIHI9IjI0LjI4NTcxNCIvPjxwYXRoIGQ9Im0zMiAwYzE3LjY3MzExMiAwIDMyIDE0LjMyNjg4OCAzMiAzMnMtMTQuMzI2ODg4IDMyLTMyIDMyLTMyLTE0LjMyNjg4OC0zMi0zMiAxNC4zMjY4ODgtMzIgMzItMzJ6bS0uMTQzNDk3OCA3LjYwNTM4MTE3Yy0xMy40NzI3NzU5IDAtMjQuMzk0NjE4NzkgMTAuOTIxODQyODMtMjQuMzk0NjE4NzkgMjQuMzk0NjE4ODNzMTAuOTIxODQyODkgMjQuMzk0NjE4OCAyNC4zOTQ2MTg3OSAyNC4zOTQ2MTg4YzEzLjQ3Mjc3NiAwIDI0LjM5NDYxODktMTAuOTIxODQyOCAyNC4zOTQ2MTg5LTI0LjM5NDYxODhzLTEwLjkyMTg0MjktMjQuMzk0NjE4ODMtMjQuMzk0NjE4OS0yNC4zOTQ2MTg4M3oiIGZpbGw9InVybCgjYykiLz48cGF0aCBkPSJtMjkuMDkwOTA5MSA0NC4zNjM2MzY0YzAgMi4wMDgzMDgxLTEuNjI4MDU1NSAzLjYzNjM2MzYtMy42MzYzNjM2IDMuNjM2MzYzNi0yLjAwODMwODIgMC0zLjYzNjM2MzctMS42MjgwNTU1LTMuNjM2MzYzNy0zLjYzNjM2MzZsLS4wMDAxODE4LTIuMTgyNjM2NC0yLjE4MTYzNjQuMDAwODE4MmMtMi4wMDgzMDgxIDAtMy42MzYzNjM2LTEuNjI4MDU1NS0zLjYzNjM2MzYtMy42MzYzNjM3IDAtMi4wMDgzMDgxIDEuNjI4MDU1NS0zLjYzNjM2MzYgMy42MzYzNjM2LTMuNjM2MzYzNmwyLjE4MTYzNjQtLjAwMDA5MDl2LTUuODE5bC0yLjE4MTYzNjQuMDAwOTA5MWMtMi4wMDgzMDgxIDAtMy42MzYzNjM2LTEuNjI4MDU1NS0zLjYzNjM2MzYtMy42MzYzNjM2IDAtMi4wMDgzMDgyIDEuNjI4MDU1NS0zLjYzNjM2MzcgMy42MzYzNjM2LTMuNjM2MzYzN2wyLjE4MTYzNjQtLjAwMDE4MTguMDAwMTgxOC0yLjE4MTYzNjRjMC0yLjAwODMwODEgMS42MjgwNTU1LTMuNjM2MzYzNiAzLjYzNjM2MzctMy42MzYzNjM2IDIuMDA4MzA4MSAwIDMuNjM2MzYzNiAxLjYyODA1NTUgMy42MzYzNjM2IDMuNjM2MzYzNmwtLjAwMDkwOTEgMi4xODE2MzY0aDUuODE5bC4wMDAwOTA5LTIuMTgxNjM2NGMwLTIuMDA4MzA4MSAxLjYyODA1NTUtMy42MzYzNjM2IDMuNjM2MzYzNi0zLjYzNjM2MzYgMi4wMDgzMDgyIDAgMy42MzYzNjM3IDEuNjI4MDU1NSAzLjYzNjM2MzcgMy42MzYzNjM2bC0uMDAwODE4MiAyLjE4MTYzNjQgMi4xODI2MzY0LjAwMDE4MThjMi4wMDgzMDgxIDAgMy42MzYzNjM2IDEuNjI4MDU1NSAzLjYzNjM2MzYgMy42MzYzNjM3IDAgMi4wMDgzMDgxLTEuNjI4MDU1NSAzLjYzNjM2MzYtMy42MzYzNjM2IDMuNjM2MzYzNmwtMi4xODI2MzY0LS4wMDA5MDkxdjUuODE5bDIuMTgyNjM2NC4wMDAwOTA5YzIuMDA4MzA4MSAwIDMuNjM2MzYzNiAxLjYyODA1NTUgMy42MzYzNjM2IDMuNjM2MzYzNiAwIDIuMDA4MzA4Mi0xLjYyODA1NTUgMy42MzYzNjM3LTMuNjM2MzYzNiAzLjYzNjM2MzdsLTIuMTgyNjM2NC0uMDAwODE4Mi4wMDA4MTgyIDIuMTgyNjM2NGMwIDIuMDA4MzA4MS0xLjYyODA1NTUgMy42MzYzNjM2LTMuNjM2MzYzNyAzLjYzNjM2MzYtMi4wMDgzMDgxIDAtMy42MzYzNjM2LTEuNjI4MDU1NS0zLjYzNjM2MzYtMy42MzYzNjM2bC0uMDAwMDkwOS0yLjE4MjYzNjRoLTUuODE5em0tLjAwMDkwOTEtOS40NTQ2MzY0aDUuODE5di01LjgxOWgtNS44MTl6IiBmaWxsPSJ1cmwoI2QpIiB0cmFuc2Zvcm09Im1hdHJpeCguODY2MDI1NCAtLjUgLjUgLjg2NjAyNTQgLTExLjcxMjgxMyAyMC4yODcxODcpIi8+PC9nPjwvc3ZnPg==`;

    private _connecting: boolean;
    private _wallet: BitpieWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: BitpieWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.bitpie) {
                    this._readyState = WalletReadyState.Installed;
                    this.emit('readyStateChange', this._readyState);
                    return true;
                }
                return false;
            });
        }
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get readyState(): WalletReadyState {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this._connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const wallet = window!.bitpie!;

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

    async signTransaction(transaction: Transaction): Promise<Transaction> {
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

    async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
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
}
