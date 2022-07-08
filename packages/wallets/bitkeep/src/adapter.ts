import {
    BaseMessageSignerWalletAdapter,
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
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
}

interface BitKeepWindow extends Window {
    bitkeep?: {
        solana?: BitKeepWallet;
    };
}

declare const window: BitKeepWindow;

export interface BitKeepWalletAdapterConfig {}

export const BitKeepWalletName = 'BitKeep' as WalletName<'BitKeep'>;

export class BitKeepWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = BitKeepWalletName;
    url = 'https://bitkeep.com';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9IiM3NTI0RjkiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMDIgNDUuNjAyN1Y0OS44MjA0QzEwMi4wMDEgNTAuMjI4MyAxMDEuODkzIDUwLjYyOTIgMTAxLjY4NyA1MC45ODI3QzEwMS40ODEgNTEuMzM2MSAxMDEuMTg1IDUxLjYyOTYgMTAwLjgyOCA1MS44MzM1TDg3LjA5MDggNTkuNjgwMUw5OS4zNjMzIDY2LjY3MUMxMDAuMTY1IDY3LjEyOTUgMTAwLjgzMSA2Ny43ODkyIDEwMS4yOTQgNjguNTgzNkMxMDEuNzU3IDY5LjM3OCAxMDIuMDAxIDcwLjI3OTEgMTAyIDcxLjE5NjJWODIuNDQyNEMxMDIuMDAxIDgzLjM2IDEwMS43NTggODQuMjYxNyAxMDEuMjk1IDg1LjA1NjdDMTAwLjgzMiA4NS44NTE2IDEwMC4xNjYgODYuNTExNyA5OS4zNjMzIDg2Ljk3MDVMNjcuMDg2OSAxMDUuM0M2Ni4yODUzIDEwNS43NTkgNjUuMzc1OSAxMDYgNjQuNDUwMiAxMDZDNjMuNTI0NSAxMDYgNjIuNjE1MSAxMDUuNzU5IDYxLjgxMzUgMTA1LjNMNTEuMjUyIDk5LjI2MTFDNTEuMDczNyA5OS4xNTkzIDUwLjkyNTYgOTkuMDEyOCA1MC44MjI3IDk4LjgzNjNDNTAuNzE5OCA5OC42NTk5IDUwLjY2NTYgOTguNDU5NyA1MC42NjU2IDk4LjI1NkM1MC42NjU2IDk4LjA1MjIgNTAuNzE5OCA5Ny44NTIgNTAuODIyNyA5Ny42NzU2QzUwLjkyNTYgOTcuNDk5MSA1MS4wNzM3IDk3LjM1MjcgNTEuMjUyIDk3LjI1MDhMODYuMTE1MiA3Ny4zODM1Qzg2LjIwNCA3Ny4zMzI1IDg2LjI3NzcgNzcuMjU5MyA4Ni4zMjkgNzcuMTcxMkM4Ni4zODAyIDc3LjA4MzIgODYuNDA3MiA3Ni45ODMzIDg2LjQwNzIgNzYuODgxN0M4Ni40MDcyIDc2Ljc4IDg2LjM4MDIgNzYuNjgwMiA4Ni4zMjkgNzYuNTkyMUM4Ni4yNzc3IDc2LjUwNCA4Ni4yMDQgNzYuNDMwOCA4Ni4xMTUyIDc2LjM3OThMNzMuMTcxOSA2OC45NzcxQzcyLjgxNTYgNjguNzczNCA3Mi40MTE0IDY4LjY2NjIgNzIgNjguNjY2MkM3MS41ODg2IDY4LjY2NjIgNzEuMTg0NCA2OC43NzM0IDcwLjgyODEgNjguOTc3MUwzNS40MTcgODkuMTcyMkMzNS4xNDk4IDg5LjMyNSAzNC44NDY3IDg5LjQwNTQgMzQuNTM4MSA4OS40MDU0QzM0LjIyOTUgODkuNDA1NCAzMy45MjY0IDg5LjMyNSAzMy42NTkyIDg5LjE3MjJMMjkuNjQ4NCA4Ni45MDA5QzI4Ljg0MjQgODYuNDQyOCAyOC4xNzI5IDg1Ljc4MiAyNy43MDc4IDg0Ljk4NTNDMjcuMjQyNyA4NC4xODg2IDI2Ljk5ODUgODMuMjg0MyAyNyA4Mi4zNjQxVjc3Ljc2NjRDMjYuOTk5OCA3Ny40NjA3IDI3LjA4MDkgNzcuMTYwMyAyNy4yMzUyIDc2Ljg5NTVDMjcuMzg5NSA3Ni42MzA3IDI3LjYxMTUgNzYuNDEwOSAyNy44Nzg5IDc2LjI1OEw3OC42NTA0IDQ3LjM2OTNDNzguNzM5MiA0Ny4zMTgzIDc4LjgxMjkgNDcuMjQ1MSA3OC44NjQxIDQ3LjE1N0M3OC45MTU0IDQ3LjA2ODkgNzguOTQyMyA0Ni45NjkxIDc4Ljk0MjMgNDYuODY3NEM3OC45NDIzIDQ2Ljc2NTggNzguOTE1NCA0Ni42NjU5IDc4Ljg2NDEgNDYuNTc3OUM3OC44MTI5IDQ2LjQ4OTggNzguNzM5MiA0Ni40MTY2IDc4LjY1MDQgNDYuMzY1Nkw2NS42ODY1IDM4LjkzNjdDNjUuMzMwMiAzOC43MzMxIDY0LjkyNjEgMzguNjI1OCA2NC41MTQ2IDM4LjYyNThDNjQuMTAzMiAzOC42MjU4IDYzLjY5OTEgMzguNzMzMSA2My4zNDI4IDM4LjkzNjdMMjguNzU3OCA1OC42M0MyOC41Nzk4IDU4LjczMTggMjguMzc3OCA1OC43ODU0IDI4LjE3MjIgNTguNzg1NUMyNy45NjY2IDU4Ljc4NTUgMjcuNzY0NiA1OC43MzIgMjcuNTg2NSA1OC42MzAzQzI3LjQwODQgNTguNTI4NiAyNy4yNjA0IDU4LjM4MjMgMjcuMTU3NSA1OC4yMDYxQzI3LjA1NDUgNTguMDI5OSAyNy4wMDAyIDU3LjgzIDI3IDU3LjYyNjRWNDUuNTQ3NkMyNi45OTg5IDQ0LjYzIDI3LjI0MiA0My43MjgzIDI3LjcwNDkgNDIuOTMzNEMyOC4xNjc4IDQyLjEzODQgMjguODM0MSA0MS40NzgzIDI5LjYzNjcgNDEuMDE5NUw2MS45MDcyIDIyLjY5NTRDNjIuNzA3MSAyMi4yMzk4IDYzLjYxMzggMjIgNjQuNTM2NiAyMkM2NS40NTk0IDIyIDY2LjM2NjEgMjIuMjM5OCA2Ny4xNjYgMjIuNjk1NEw5OS4zNjMzIDQxLjA4MzNDMTAwLjE2NSA0MS41NDE0IDEwMC44MyA0Mi4yMDAxIDEwMS4yOTMgNDIuOTkzNEMxMDEuNzU2IDQzLjc4NjcgMTAyIDQ0LjY4NjYgMTAyIDQ1LjYwMjdaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';

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
