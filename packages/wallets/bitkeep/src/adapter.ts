import {
    BaseSignerWalletAdapter,
    WalletAccountError,
    WalletDisconnectionError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignTransactionError,
    scopePollingDetectionStrategy,
    WalletName,
    Adapter,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';

interface BitKeepWallet {
    isBitKeep?: boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getAccount(): Promise<string>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}

interface BitKeepWindow extends Window {
    bitkeep?: {
        solana?: BitKeepWallet;
    };
}

declare const window: BitKeepWindow;

export interface BitKeepWalletAdapterConfig {}

export const BitKeepWalletName = 'BitKeep' as WalletName;

export class BitKeepWalletAdapter extends BaseSignerWalletAdapter {
    name = BitKeepWalletName;
    url = 'https://bitkeep.com';
    icon =
        'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHdpZHRoPSIxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iIzQ5NWJmZiI+PHBhdGggZD0ibTYyLjI4NTcgODcuOTY0NC0zNi44MTI5LTIxLjI2MzhjLTEuMjkzMi0uNzQ3Ni0yLjA4ODktMi4xMjctMi4wODg5LTMuNjIwOXYtNDIuNTc5NGMwLS42NDQyLS42OTctMS4wNDY5LTEuMjU1LS43MjQybC03LjUzMjUgNC4zNTVjLTIuODQ1IDEuNjQ1NC00LjU5NjQgNC42ODEzLTQuNTk2NCA3Ljk2NjF2MzUuODA3OWMwIDMuMjg2IDEuNzUxNCA2LjMyMTkgNC41OTY0IDcuOTY2MWwzMC45NTA0IDE3Ljg5MjljMi44NDg4IDEuNjQ3OSA2LjM2MTMgMS42NDc5IDkuMjExMyAwbDcuNTI3Ni00LjM1MjVjLjU1NzktLjMyMDIuNTU3OS0xLjEyNDUgMC0xLjQ0NzJ6Ii8+PHBhdGggZD0ibTMyLjE1OTYgNjIuODE4NSAxNS44OTE1IDkuMTg3OWMxLjI5NTcuNzQ4OCAyLjg5MTkuNzQ4OCA0LjE4NjMgMGwxNS44OTUyLTkuMTg3OWMxLjI5MzItLjc0NzYgMi4wODg4LTIuMTI3IDIuMDg4OC0zLjYyMDl2LTE4LjM4NjhjMC0xLjQ5MzktLjc5NjgtMi44NzMzLTIuMDg4OC0zLjYyMDlsLTE1Ljg5NC05LjE4OTFjLTEuMjk1Ni0uNzQ4OC0yLjg5MTgtLjc0ODgtNC4xODYyIDBsLTMuOTQzNyAyLjI3OTdjLS4yNzk1LjE2MTQtLjYyODEtLjA0MDYtLjYyODEtLjM2MjFsLjAyNTktMjEuMDE3NDdjLjAwMTItLjY0NDE0LS42OTcxLTEuMDQ4MTEtMS4yNTUtLjcyNTQybC0xMC4wNjM2IDUuODE4MTljLTEuMjkxOS43NDYzLTIuMDg3NSAyLjEyNTctMi4wODg4IDMuNjE4NGwtLjAyNzEgNDEuNTgzYy0uMDAyNCAxLjQ5NC43OTQ0IDIuODc1OCAyLjA4NzYgMy42MjM0em05LjIwMjYtMTYuMTg3MWMwLTEuMDU1NS41NjI5LTIuMDMwOSAxLjQ3NjctMi41NTkzbDUuODI4LTMuMzY4NGMuOTE1MS0uNTI5NiAyLjA0MzMtLjUyOTYgMi45NTg0IDBsNS44MjggMy4zNjg0Yy45MTM4LjUyODQgMS40NzY3IDEuNTAzOCAxLjQ3NjcgMi41NTkzdjYuNzQ0M2MwIDEuMDU1NS0uNTYyOSAyLjAzMS0xLjQ3NjcgMi41NTkzbC01LjgyOCAzLjM2ODVjLS45MTUxLjUyOTYtMi4wNDMzLjUyOTYtMi45NTg0IDBsLTUuODI4LTMuMzY4NWMtLjkxMzgtLjUyODMtMS40NzY3LTEuNTAzOC0xLjQ3NjctMi41NTkzeiIvPjxwYXRoIGQ9Im04NS43MDQ3IDI0LjEyLTMwLjk1MDUtMTcuODk0MDljLTEuMjk2OC0uNzUwMDUtMi43MzA0LTEuMTU3NzEtNC4xNzY0LTEuMjI1NDUtLjIzNzctLjAxMTA5LS40MzYuMTgxMDQtLjQzNi40MTg3NXYxMy4xMjQwOWMwIC4yOTkzLjE1ODkuNTc1MS40MTc2LjcyNDJsMjQuMjY4OSAxNC4wMjMxYzEuMjkzMi43NDc2IDIuMDg4OCAyLjEyNyAyLjA4ODggMy42MjF2MjYuMTU1OGMwIDEuNDkzOS0uNzk2OCAyLjg3MzMtMi4wODg4IDMuNjIwOWwtMTYuNzMxNSA5LjY3MzFjLS41NTY3LjMyMjctLjU1NjcgMS4xMjY5IDAgMS40NDg0bDExLjI4OSA2LjUxNzdjLjUxODUuMjk5MyAxLjE1NjUuMjk5MyAxLjY3MzggMGwxNC42NDUxLTguNDY2MWMyLjg0MzgtMS42NDQyIDQuNTk2NC00LjY4MDIgNC41OTY0LTcuOTY2MXYtMzUuODA5MmMwLTMuMjg1OS0xLjc1MTQtNi4zMjE5LTQuNTk2NC03Ljk2NjF6Ii8+PC9nPjwvc3ZnPg==';

    private _connecting: boolean;
    private _wallet: BitKeepWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: BitKeepWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.bitkeep?.solana?.isBitKeep) {
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
            const wallet = window!.bitkeep!.solana!;

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
