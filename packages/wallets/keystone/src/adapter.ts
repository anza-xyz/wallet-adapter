import type { DefaultKeyring } from '@keystonehq/sol-keyring';
import type { WalletName } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    WalletAccountError,
    WalletLoadError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type { Transaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

export interface KeystoneWalletAdapterConfig {}

export const KeystoneWalletName = 'Keystone' as WalletName<'Keystone'>;

export class KeystoneWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = KeystoneWalletName;
    url = 'https://keyst.one';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjE2IiBmaWxsPSJ3aGl0ZSIvPgogICAgPHJlY3QgeD0iNSIgeT0iNSIgd2lkdGg9IjIyIiBoZWlnaHQ9IjIyIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIxIi8+CiAgICA8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE0LjY5NjUgNS40MzQ4N0MxNS4wOTEgNC43NTMxNiAxNi4wNzQ5IDQuNzUyMTEgMTYuNDcwOCA1LjQzMjk5TDE3LjMzOTggNi45MjcxOUMxNy42NDkgNy40NTg5NiAxNy42NDg3IDguMTE1ODggMTcuMzM4OSA4LjY0NzM0TDkuNjMxMjEgMjEuODcxQzkuMjE4NTEgMjIuNTc5MSA4LjE5NjIzIDIyLjU4MTEgNy43ODA3NiAyMS44NzQ2QzcuNzMxMzIgMjEuNzkwNiA3LjY5MzU4IDIxLjcwMDEgNy42Njg1OCAyMS42MDU4TDcuMzcwODggMjAuNDgyOUM3LjA5MjY2IDE5LjQzMzQgNy4yNDE4IDE4LjMxNjQgNy43ODU2MyAxNy4zNzY3TDE0LjY5NjUgNS40MzQ4N1pNMTIuNjYzNiAxOS4yODU4QzEzLjA2MzUgMTguNTk5NyAxNC4wMDM1IDE4LjQ3NTcgMTQuNTY3NyAxOS4wMzQ1TDE3LjQyODggMjEuODY4NkMxOC44NjA1IDIzLjI4NjcgMTguODU2NSAyNS42MDE2IDE3LjQyIDI3LjAxNDlDMTcuMjA0NSAyNy4yMjY5IDE2Ljg3OTggMjcuMjgyNSAxNi42MDYgMjcuMTU0MkwxMS42MDAyIDI0LjgwODFDMTAuNjkwNyAyNC4zODE5IDEwLjM0MyAyMy4yNjcxIDEwLjg0ODcgMjIuMzk5NEwxMi42NjM2IDE5LjI4NThaTTIwLjQzNSAxNi4zMzcyQzIxLjQ4OTcgMTYuMzM3MiAyMi4xNDc0IDE1LjE5MzkgMjEuNjE3MiAxNC4yODIyTDE5Ljc4MjggMTEuMTI4QzE5LjI1NTggMTAuMjIxOCAxNy45NDcxIDEwLjIyMTIgMTcuNDE5MiAxMS4xMjY5TDE1LjQzMDkgMTQuNTM4MUMxNC45NjYgMTUuMzM1OCAxNS41NDE0IDE2LjMzNzIgMTYuNDY0NyAxNi4zMzcyTDIwLjQzNSAxNi4zMzcyWiIgZmlsbD0iYmxhY2siLz4KICAgIDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjEuNzMwMyAxNy42NDU5QzIyLjg3MTMgMTcuNjQ1OSAyMy45MjYxIDE4LjI1MjcgMjQuNDk5OCAxOS4yMzlWMTkuMjM5QzI0LjY3NjMgMTkuNTQyNyAyNC42MjQ3IDE5LjkyNzQgMjQuMzc0MyAyMC4xNzM3TDIyLjA1MTEgMjIuNDU5QzIxLjQ1MDkgMjMuMDQ5NCAyMC40ODc3IDIzLjA0NzggMTkuODg5NSAyMi40NTUzTDE2LjUxMDEgMTkuMTA3OEMxNS45Njc3IDE4LjU3MDYgMTYuMzQ4MSAxNy42NDU5IDE3LjExMTYgMTcuNjQ1OUwyMS43MzAzIDE3LjY0NTlaIiBmaWxsPSIjMjE2MUZGIi8+Cjwvc3ZnPgo=';
    readonly supportedTransactionVersions = null;

    private _keyring: DefaultKeyring | null;
    private _publicKey: PublicKey | null;
    private _connecting: boolean;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.Loadable;

    get publicKey() {
        return this._publicKey;
    }

    get connecting() {
        return this._connecting;
    }

    get readyState() {
        return this._readyState;
    }

    constructor(config: KeystoneWalletAdapterConfig = {}) {
        super();
        this._keyring = null;
        this._publicKey = null;
        this._connecting = false;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Loadable) throw new WalletNotReadyError();

            this._connecting = true;

            let keyring: DefaultKeyring;
            try {
                const { DefaultKeyring } = await import('@keystonehq/sol-keyring');
                keyring = DefaultKeyring.getEmptyKeyring();
            } catch (error: any) {
                throw new WalletLoadError(error?.message, error);
            }

            let account: string;
            try {
                await keyring.readKeyring();
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                account = keyring.getAccounts()[0]!.pubKey;
            } catch (error: any) {
                throw new WalletAccountError(error?.message, error);
            }

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(account);
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            this._keyring = keyring;
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
        if (this._keyring) {
            this._keyring = null;
            this._publicKey = null;
        }

        this.emit('disconnect');
    }

    async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
        try {
            const keyring = this._keyring;
            const publicKey = this._publicKey?.toString();
            if (!keyring || !publicKey) throw new WalletNotConnectedError();

            try {
                return (await keyring.signTransaction(publicKey, transaction)) as T;
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
            const keyring = this._keyring;
            const publicKey = this._publicKey?.toString();
            if (!keyring || !publicKey) throw new WalletNotConnectedError();

            try {
                return keyring.signMessage(publicKey, message);
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
}
