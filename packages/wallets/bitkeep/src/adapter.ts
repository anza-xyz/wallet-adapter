import {
    BaseSignerWalletAdapter,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletDisconnectionError,
    WalletName,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignTransactionError,
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

export const BitKeepWalletName = 'BitKeep' as WalletName<'BitKeep'>;

export class BitKeepWalletAdapter extends BaseSignerWalletAdapter {
    name = BitKeepWalletName;
    url = 'https://bitkeep.com';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01MTIgMTYwLjkzNUM1MTIgMTU2LjI0NSA1MTIgMTQ5Ljg4IDUxMS45IDE0Mi4xMjVDNTExLjgyNSAxMzMuOTUgNTExLjc3NSAxMzAuNjI1IDUxMS43IDEyNi43NTVDNTExLjQ4IDExNS4yNTUgNTEwLjczNSAxMDMuNjQ1IDUwOC43ODUgOTMuMjU1QzUwNi42NTUgODEuOTM1IDUwMy43ODUgNzEuNjUgNDk4LjU2IDYxLjM2QzQ5My4yNjUgNTAuOTE1IDQ4Ni4wMSA0MS44OSA0NzguMTUgMzMuODZDNDcwLjEgMjYgNDYxLjA3NSAxOC43NDUgNDUwLjY1IDEzLjQ1QzQ0MC4zNiA4LjI0IDQzMC4wNzUgNS4zNTUgNDE4Ljc1NSAzLjIyNUM0MDguMzc1IDEuMjc1IDM5Ni43NTUgMC41MyAzODUuMjU1IDAuMzFDMzgxLjM3NSAwLjIyNSAzNzguMDUgMC4xNzUgMzY5Ljg3NSAwLjFDMzYyLjEyIDAuMDMgMzU1Ljc1NSAwIDM1MS4wNjUgMEgxNjAuOTM1QzE1Ni4yNDUgMCAxNDkuODggMC4wMyAxNDIuMTI1IDAuMUMxMzMuOTUgMC4xNzUgMTMwLjYyNSAwLjIyNSAxMjYuNzU1IDAuM0MxMTUuMjU1IDAuNTIgMTAzLjY1IDEuMjY1IDkzLjI1NSAzLjIxNUM4MS45MzUgNS4zNDUgNzEuNjUgOC4yMTUgNjEuMzYgMTMuNDRDNTAuOTI1IDE4LjczNSA0MS45IDI2IDMzLjg1IDMzLjg1QzI1Ljk5IDQxLjkgMTguNzM1IDUwLjkyNSAxMy40NCA2MS4zNUM4LjIzIDcxLjY0IDUuMzQ1IDgxLjkyNSAzLjIxNSA5My4yNDVDMS4yNjUgMTAzLjYyNSAwLjUyIDExNS4yNDUgMC4zIDEyNi43NDVDMC4yMjUgMTMwLjYyNSAwLjE3NSAxMzMuOTUgMC4xIDE0Mi4xMjVDMC4wMyAxNDkuODggMCAxNTYuMjQ1IDAgMTYwLjkzNVYzNTEuMDY1QzAgMzU1Ljc1NSAwLjAzIDM2Mi4xMiAwLjEgMzY5Ljg3NUMwLjE3NSAzNzguMDUgMC4yMjUgMzgxLjM3NSAwLjMgMzg1LjI0NUMwLjUyIDM5Ni43NDUgMS4yNjUgNDA4LjM1NSAzLjIxNSA0MTguNzQ1QzUuMzQ1IDQzMC4wNjUgOC4yMTUgNDQwLjM1IDEzLjQ0IDQ1MC42NEMxOC43MzUgNDYxLjA4NSAyNS45OSA0NzAuMTEgMzMuODUgNDc4LjE0QzQxLjkgNDg2IDUwLjkyNSA0OTMuMjU1IDYxLjM1IDQ5OC41NUM3MS42NCA1MDMuNzYgODEuOTI1IDUwNi42NDUgOTMuMjQ1IDUwOC43NzVDMTAzLjYzIDUxMC43MjUgMTE1LjI0NSA1MTEuNDcgMTI2Ljc0NSA1MTEuNjlDMTMwLjYxNSA1MTEuNzY1IDEzMy45NCA1MTEuODE1IDE0Mi4xMTUgNTExLjg5QzE0OS44NyA1MTEuOTY1IDE1Ni4yMzUgNTExLjk5IDE2MC45MjUgNTExLjk5SDM1MS4wNjVDMzU1Ljc1NSA1MTEuOTkgMzYyLjEyIDUxMS45OSAzNjkuODc1IDUxMS44OUMzNzguMDUgNTExLjgxNSAzODEuMzc1IDUxMS43NjUgMzg1LjI0NSA1MTEuNjlDMzk2Ljc0NSA1MTEuNDcgNDA4LjM1NSA1MTAuNzI1IDQxOC43NDUgNTA4Ljc3NUM0MzAuMDY1IDUwNi42NDUgNDQwLjM1IDUwMy43NzUgNDUwLjY0IDQ5OC41NUM0NjEuMDg1IDQ5My4yNTUgNDcwLjExIDQ4NiA0NzguMTQgNDc4LjE0QzQ4NiA0NzAuMDkgNDkzLjI1NSA0NjEuMDY1IDQ5OC41NSA0NTAuNjRDNTAzLjc2IDQ0MC4zNSA1MDYuNjQ1IDQzMC4wNjUgNTA4Ljc3NSA0MTguNzQ1QzUxMC43MjUgNDA4LjM2NSA1MTEuNDcgMzk2Ljc0NSA1MTEuNjkgMzg1LjI0NUM1MTEuNzY1IDM4MS4zNzUgNTExLjgxNSAzNzguMDUgNTExLjg5IDM2OS44NzVDNTExLjk2NSAzNjIuMTIgNTExLjk5IDM1NS43NTUgNTExLjk5IDM1MS4wNjVMNTEyIDE2MC45MzVaIiBmaWxsPSIjNzUyNEY5Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNDE1LjEyNSAxNzcuMTU1VjE5NS4yMzVDNDE1LjEyNSAxOTYuOTg1IDQxNC42NjMgMTk4LjcwNCA0MTMuNzg1IDIwMC4yMThDNDEyLjkwNyAyMDEuNzMxIDQxMS42NDQgMjAyLjk4NiA0MTAuMTI1IDIwMy44NTVMMzUxLjg3IDIzNy41TDQwMy45MiAyNjcuNDY1QzQwNy4zMyAyNjkuNDI2IDQxMC4xNjIgMjcyLjI1MiA0MTIuMTMxIDI3NS42NTdDNDE0LjEgMjc5LjA2MiA0MTUuMTM2IDI4Mi45MjYgNDE1LjEzNSAyODYuODZWMzM1LjA2QzQxNS4xMzQgMzM4Ljk5OCA0MTQuMDk1IDM0Mi44NjYgNDEyLjEyMSAzNDYuMjc0QzQxMC4xNDggMzQ5LjY4MiA0MDcuMzEgMzUyLjUwOSA0MDMuODk1IDM1NC40N0wyNjcgNDMzLjAzQzI2My42MDEgNDM0Ljk4MSAyNTkuNzUgNDM2LjAwNSAyNTUuODMxIDQzNkMyNTEuOTEyIDQzNS45OTQgMjQ4LjA2MyA0MzQuOTYgMjQ0LjY3IDQzM0wxOTkuODUgNDA3LjEyQzE5OS4wOTMgNDA2LjY4NCAxOTguNDY0IDQwNi4wNTYgMTk4LjAyNyA0MDUuM0MxOTcuNTg5IDQwNC41NDQgMTk3LjM1OSA0MDMuNjg2IDE5Ny4zNTkgNDAyLjgxMkMxOTcuMzU5IDQwMS45MzkgMTk3LjU4OSA0MDEuMDgxIDE5OC4wMjcgNDAwLjMyNEMxOTguNDY0IDM5OS41NjggMTk5LjA5MyAzOTguOTQxIDE5OS44NSAzOTguNTA1TDM0Ny43ODUgMzEzLjM1NUMzNDguMTYgMzEzLjEzNCAzNDguNDcyIDMxMi44MTkgMzQ4LjY4OCAzMTIuNDQxQzM0OC45MDQgMzEyLjA2MyAzNDkuMDE4IDMxMS42MzUgMzQ5LjAxOCAzMTEuMkMzNDkuMDE4IDMxMC43NjQgMzQ4LjkwNCAzMTAuMzM3IDM0OC42ODggMzA5Ljk1OUMzNDguNDcyIDMwOS41ODEgMzQ4LjE2IDMwOS4yNjYgMzQ3Ljc4NSAzMDkuMDQ1TDI5Mi44MzUgMjc3LjMxNUMyOTEuMzI0IDI3Ni40NDMgMjg5LjYxIDI3NS45ODQgMjg3Ljg2NSAyNzUuOTg0QzI4Ni4xMiAyNzUuOTg0IDI4NC40MDYgMjc2LjQ0MyAyODIuODk1IDI3Ny4zMTVMMTMyLjU4IDM2My45MDVDMTMxLjQ1IDM2NC41NTUgMTMwLjE2OSAzNjQuODk2IDEyOC44NjUgMzY0Ljg5NkMxMjcuNTYxIDM2NC44OTYgMTI2LjI4IDM2NC41NTUgMTI1LjE1IDM2My45MDVMMTA4LjE1IDM1NC4xNjVDMTA0LjcyNyAzNTIuMjA1IDEwMS44ODIgMzQ5LjM3NSA5OS45MDM4IDM0NS45NjJDOTcuOTI1NiAzNDIuNTQ5IDk2Ljg4NDIgMzM4LjY3NSA5Ni44ODUgMzM0LjczVjMxNUM5Ni44ODcxIDMxMy42ODkgOTcuMjM0MyAzMTIuNDAyIDk3Ljg5MTggMzExLjI2OEM5OC41NDkyIDMxMC4xMzQgOTkuNDkzNiAzMDkuMTkzIDEwMC42MyAzMDguNTRMMzE2LjA1NSAxODQuNzNDMzE2LjQyOSAxODQuNTA5IDMxNi43MzkgMTg0LjE5NCAzMTYuOTU1IDE4My44MTdDMzE3LjE3IDE4My40MzkgMzE3LjI4NCAxODMuMDEyIDMxNy4yODQgMTgyLjU3N0MzMTcuMjg0IDE4Mi4xNDMgMzE3LjE3IDE4MS43MTYgMzE2Ljk1NSAxODEuMzM4QzMxNi43MzkgMTgwLjk2MSAzMTYuNDI5IDE4MC42NDYgMzE2LjA1NSAxODAuNDI1TDI2MS4wNTUgMTQ4LjU4NUMyNTkuNTQzIDE0Ny43MTQgMjU3LjgzIDE0Ny4yNTYgMjU2LjA4NSAxNDcuMjU2QzI1NC4zNCAxNDcuMjU2IDI1Mi42MjcgMTQ3LjcxNCAyNTEuMTE1IDE0OC41ODVMMTA0LjMyIDIzM0MxMDMuNTYyIDIzMy40MjcgMTAyLjcwNiAyMzMuNjQ5IDEwMS44MzYgMjMzLjY0NEMxMDAuOTY2IDIzMy42MzkgMTAwLjExMyAyMzMuNDA3IDk5LjM2MDEgMjMyLjk3MkM5OC42MDczIDIzMi41MzYgOTcuOTgxMSAyMzEuOTExIDk3LjU0MzUgMjMxLjE1OUM5Ny4xMDYgMjMwLjQwOCA5Ni44NzIxIDIyOS41NTUgOTYuODY1IDIyOC42ODVWMTc2LjkyNUM5Ni44NjI0IDE3Mi45ODQgOTcuOTAwNSAxNjkuMTEzIDk5Ljg3NDEgMTY1LjcwMkMxMDEuODQ4IDE2Mi4yOTEgMTA0LjY4NyAxNTkuNDYyIDEwOC4xMDUgMTU3LjVMMjQ1IDc4Ljk3QzI0OC4zOTYgNzcuMDE5MiAyNTIuMjQ1IDc1Ljk5NDYgMjU2LjE2MSA3NS45OTlDMjYwLjA3NyA3Ni4wMDM0IDI2My45MjQgNzcuMDM2NiAyNjcuMzE1IDc4Ljk5NUw0MDMuOTI1IDE1Ny43OEM0MDcuMzI4IDE1OS43NDMgNDEwLjE1NCAxNjIuNTY2IDQxMi4xMiAxNjUuOTY3QzQxNC4wODYgMTY5LjM2OCA0MTUuMTIyIDE3My4yMjcgNDE1LjEyNSAxNzcuMTU1WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==';

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
