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
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type { Transaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

interface SarosWallet {
    signTransaction(transaction: Transaction): Promise<Transaction>;
    isConnected(): boolean;
    connect(): Promise<string[]>;
    disconnect(): Promise<void>;
    request(params: { method: string; params: string | string[] | unknown }): Promise<{
        signature: string;
        publicKey: string;
        signatures: string[];
    }>;
}

interface SarosWindow extends Window {
    saros?: SarosWallet;
}

declare const window: SarosWindow;

export interface SarosWalletAdapterConfig {}

export const SarosWalletName = 'Saros' as WalletName<'Saros'>;

export class SarosWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = SarosWalletName;
    url = 'https://www.saros.xyz/';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjNUYzQ0Q4Ii8+CjxwYXRoIGQ9Ik0zMi4wMDMgOC42NjUzMkMyNy4zODc4IDguNjY0NzEgMjIuODc1OSAxMC4wMzI4IDE5LjAzODIgMTIuNTk2NEMxNS4yMDA0IDE1LjE2MDEgMTIuMjA5MSAxOC44MDQzIDEwLjQ0MjQgMjMuMDY4MUM4LjY3NTgzIDI3LjMzMTkgOC4yMTMzIDMyLjAyMzggOS4xMTMzMyAzNi41NTA1QzEwLjAxMzQgNDEuMDc3MiAxMi4yMzU1IDQ1LjIzNTMgMTUuNDk4OCA0OC40OTlDMTguNzYyMSA1MS43NjI4IDIyLjkyIDUzLjk4NTUgMjcuNDQ2NSA1NC44ODYxQzMxLjk3MzEgNTUuNzg2NyAzNi42NjUxIDU1LjMyNDggNDAuOTI5MSA1My41NTg3QzQ1LjE5MzEgNTEuNzkyNyA0OC44Mzc3IDQ4LjgwMTggNTEuNDAxOSA0NC45NjQ0QzUzLjk2NjEgNDEuMTI2OSA1NS4zMzQ3IDM2LjYxNTMgNTUuMzM0NyAzMkM1NS4zMzQ3IDI1LjgxMTggNTIuODc2NiAxOS44NzcgNDguNTAxMiAxNS41MDFDNDQuMTI1NyAxMS4xMjQ5IDM4LjE5MTMgOC42NjYxMiAzMi4wMDMgOC42NjUzMlpNMzIuMDAzIDUyLjAwMkMyOC4wNDY4IDUyLjAwMzIgMjQuMTc5IDUwLjgzMTEgMjAuODg4OSA0OC42MzRDMTcuNTk4NyA0Ni40MzY5IDE1LjAzNDEgNDMuMzEzNCAxMy41MTkzIDM5LjY1ODZDMTIuMDA0NCAzNi4wMDM5IDExLjYwNzQgMzEuOTgxOSAxMi4zNzg1IDI4LjEwMTVDMTMuMTQ5NiAyNC4yMjExIDE1LjA1NDIgMjAuNjU2NSAxNy44NTEzIDE3Ljg1ODZDMjAuNjQ4MyAxNS4wNjA2IDI0LjIxMjQgMTMuMTU1IDI4LjA5MjUgMTIuMzgyOEMzMS45NzI3IDExLjYxMDUgMzUuOTk0OCAxMi4wMDYyIDM5LjY1IDEzLjUyQzQzLjMwNTMgMTUuMDMzNyA0Ni40Mjk1IDE3LjU5NzQgNDguNjI3NiAyMC44ODY4QzUwLjgyNTcgMjQuMTc2MyA1MS45OTkgMjguMDQzNyA1MS45OTkgMzJDNTEuOTk5IDM3LjMwMzggNDkuODkyNSA0Mi4zOTA1IDQ2LjE0MjcgNDYuMTQxNEM0Mi4zOTI5IDQ5Ljg5MjMgMzcuMzA2OSA1Mi4wMDA0IDMyLjAwMyA1Mi4wMDJaTTMyLjAwMyAyQzI2LjA2OTUgMS45OTk0IDIwLjI2OSAzLjc1ODM2IDE1LjMzNTEgNy4wNTQ0M0MxMC40MDEyIDEwLjM1MDUgNi41NTU1OSAxNS4wMzU3IDQuMjg0NSAyMC41MTc0QzIuMDEzNCAyNS45OTkxIDEuNDE4ODcgMzIuMDMxMiAyLjU3NjA4IDM3Ljg1MDhDMy43MzMzIDQzLjY3MDUgNi41OTAyOCA0OS4wMTYyIDEwLjc4NTcgNTMuMjEyMUMxNC45ODEyIDU3LjQwOCAyMC4zMjY3IDYwLjI2NTUgMjYuMTQ2MiA2MS40MjMzQzMxLjk2NTcgNjIuNTgxMSAzNy45OTc4IDYxLjk4NzIgNDMuNDc5OCA1OS43MTY3QzQ4Ljk2MTggNTcuNDQ2MSA1My42NDczIDUzLjYwMSA1Ni45NDM5IDQ4LjY2NzRDNjAuMjQwNSA0My43MzM5IDYyIDM3LjkzMzYgNjIgMzJDNjIgMjQuMDQ0IDU4LjgzOTcgMTYuNDEzOSA1My4yMTQzIDEwLjc4NzlDNDcuNTg4OCA1LjE2MTg3IDM5Ljk1OSAyLjAwMDgxIDMyLjAwMyAyWk0zMi4wMDMgNTguNjY3M0MyNi43Mjg1IDU4LjY2ODUgMjEuNTcyIDU3LjEwNTUgMTcuMTg1OCA1NC4xNzZDMTIuNzk5NiA1MS4yNDY1IDkuMzgwNjMgNDcuMDgyMSA3LjM2MTMxIDQyLjIwOTRDNS4zNDE5OSAzNy4zMzY2IDQuODEzMDIgMzEuOTc0NSA1Ljg0MTMgMjYuODAxMkM2Ljg2OTU4IDIxLjYyNzggOS40MDg5MSAxNi44NzU2IDEzLjEzODIgMTMuMTQ1NUMxNi44Njc0IDkuNDE1MzkgMjEuNjE5MSA2Ljg3NDk3IDI2Ljc5MjIgNS44NDU1MUMzMS45NjUzIDQuODE2MDUgMzcuMzI3NSA1LjM0MzggNDIuMjAwNyA3LjM2MjAxQzQ3LjA3MzkgOS4zODAyMiA1MS4yMzkxIDEyLjc5ODIgNTQuMTY5NiAxNy4xODM4QzU3LjEwMDEgMjEuNTY5MyA1OC42NjQzIDI2LjcyNTQgNTguNjY0MyAzMkM1OC42NjQzIDM5LjA3MTYgNTUuODU1NSA0NS44NTM2IDUwLjg1NTggNTAuODU0NUM0NS44NTYgNTUuODU1NCAzOS4wNzQ2IDU4LjY2NTcgMzIuMDAzIDU4LjY2NzNaTTMyLjAwMyA4LjY2NTMyQzI3LjM4NzggOC42NjQ3MSAyMi44NzU5IDEwLjAzMjggMTkuMDM4MiAxMi41OTY0QzE1LjIwMDQgMTUuMTYwMSAxMi4yMDkxIDE4LjgwNDMgMTAuNDQyNCAyMy4wNjgxQzguNjc1ODMgMjcuMzMxOSA4LjIxMzMgMzIuMDIzOCA5LjExMzMzIDM2LjU1MDVDMTAuMDEzNCA0MS4wNzcyIDEyLjIzNTUgNDUuMjM1MyAxNS40OTg4IDQ4LjQ5OUMxOC43NjIxIDUxLjc2MjggMjIuOTIgNTMuOTg1NSAyNy40NDY1IDU0Ljg4NjFDMzEuOTczMSA1NS43ODY3IDM2LjY2NTEgNTUuMzI0OCA0MC45MjkxIDUzLjU1ODdDNDUuMTkzMSA1MS43OTI3IDQ4LjgzNzcgNDguODAxOCA1MS40MDE5IDQ0Ljk2NDRDNTMuOTY2MSA0MS4xMjY5IDU1LjMzNDcgMzYuNjE1MyA1NS4zMzQ3IDMyQzU1LjMzNDcgMjUuODExOCA1Mi44NzY2IDE5Ljg3NyA0OC41MDEyIDE1LjUwMUM0NC4xMjU3IDExLjEyNDkgMzguMTkxMyA4LjY2NjEyIDMyLjAwMyA4LjY2NTMyWk0zMi4wMDMgNTIuMDAyQzI4LjA0NjggNTIuMDAzMiAyNC4xNzkgNTAuODMxMSAyMC44ODg5IDQ4LjYzNEMxNy41OTg3IDQ2LjQzNjkgMTUuMDM0MSA0My4zMTM0IDEzLjUxOTMgMzkuNjU4NkMxMi4wMDQ0IDM2LjAwMzkgMTEuNjA3NCAzMS45ODE5IDEyLjM3ODUgMjguMTAxNUMxMy4xNDk2IDI0LjIyMTEgMTUuMDU0MiAyMC42NTY1IDE3Ljg1MTMgMTcuODU4NkMyMC42NDgzIDE1LjA2MDYgMjQuMjEyNCAxMy4xNTUgMjguMDkyNSAxMi4zODI4QzMxLjk3MjcgMTEuNjEwNSAzNS45OTQ4IDEyLjAwNjIgMzkuNjUgMTMuNTJDNDMuMzA1MyAxNS4wMzM3IDQ2LjQyOTUgMTcuNTk3NCA0OC42Mjc2IDIwLjg4NjhDNTAuODI1NyAyNC4xNzYzIDUxLjk5OSAyOC4wNDM3IDUxLjk5OSAzMkM1MS45OTkgMzcuMzAzOCA0OS44OTI1IDQyLjM5MDUgNDYuMTQyNyA0Ni4xNDE0QzQyLjM5MjkgNDkuODkyMyAzNy4zMDY5IDUyLjAwMDQgMzIuMDAzIDUyLjAwMlpNMzIuMDAzIDguNjY1MzJDMjcuMzg3OCA4LjY2NDcxIDIyLjg3NTkgMTAuMDMyOCAxOS4wMzgyIDEyLjU5NjRDMTUuMjAwNCAxNS4xNjAxIDEyLjIwOTEgMTguODA0MyAxMC40NDI0IDIzLjA2ODFDOC42NzU4MyAyNy4zMzE5IDguMjEzMyAzMi4wMjM4IDkuMTEzMzMgMzYuNTUwNUMxMC4wMTM0IDQxLjA3NzIgMTIuMjM1NSA0NS4yMzUzIDE1LjQ5ODggNDguNDk5QzE4Ljc2MjEgNTEuNzYyOCAyMi45MiA1My45ODU1IDI3LjQ0NjUgNTQuODg2MUMzMS45NzMxIDU1Ljc4NjcgMzYuNjY1MSA1NS4zMjQ4IDQwLjkyOTEgNTMuNTU4N0M0NS4xOTMxIDUxLjc5MjcgNDguODM3NyA0OC44MDE4IDUxLjQwMTkgNDQuOTY0NEM1My45NjYxIDQxLjEyNjkgNTUuMzM0NyAzNi42MTUzIDU1LjMzNDcgMzJDNTUuMzM0NyAyNS44MTE4IDUyLjg3NjYgMTkuODc3IDQ4LjUwMTIgMTUuNTAxQzQ0LjEyNTcgMTEuMTI0OSAzOC4xOTEzIDguNjY2MTIgMzIuMDAzIDguNjY1MzJaTTMyLjAwMyA1Mi4wMDJDMjguMDQ2OCA1Mi4wMDMyIDI0LjE3OSA1MC44MzExIDIwLjg4ODkgNDguNjM0QzE3LjU5ODcgNDYuNDM2OSAxNS4wMzQxIDQzLjMxMzQgMTMuNTE5MyAzOS42NTg2QzEyLjAwNDQgMzYuMDAzOSAxMS42MDc0IDMxLjk4MTkgMTIuMzc4NSAyOC4xMDE1QzEzLjE0OTYgMjQuMjIxMSAxNS4wNTQyIDIwLjY1NjUgMTcuODUxMyAxNy44NTg2QzIwLjY0ODMgMTUuMDYwNiAyNC4yMTI0IDEzLjE1NSAyOC4wOTI1IDEyLjM4MjhDMzEuOTcyNyAxMS42MTA1IDM1Ljk5NDggMTIuMDA2MiAzOS42NSAxMy41MkM0My4zMDUzIDE1LjAzMzcgNDYuNDI5NSAxNy41OTc0IDQ4LjYyNzYgMjAuODg2OEM1MC44MjU3IDI0LjE3NjMgNTEuOTk5IDI4LjA0MzcgNTEuOTk5IDMyQzUxLjk5OSAzNy4zMDM4IDQ5Ljg5MjUgNDIuMzkwNSA0Ni4xNDI3IDQ2LjE0MTRDNDIuMzkyOSA0OS44OTIzIDM3LjMwNjkgNTIuMDAwNCAzMi4wMDMgNTIuMDAyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==';
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: SarosWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: SarosWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.saros) {
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
        return !!this._wallet?.isConnected();
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
            const wallet = window.saros!;

            let account: string;
            try {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                account = (await wallet.connect())[0]!;
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
                const response = await wallet.request({ method: 'sol_sign', params: [transaction] });

                const publicKey = new PublicKey(response.publicKey);
                const signature = bs58.decode(response.signature);

                transaction.addSignature(publicKey, signature);
                return transaction;
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
                const response = await wallet.request({ method: 'sol_signAllTransactions', params: [transactions] });

                const publicKey = new PublicKey(response.publicKey);
                const signatures = response.signatures;

                return transactions.map((transaction, index) => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const signature = bs58.decode(signatures[index]!);
                    transaction.addSignature(publicKey, signature);
                    return transaction;
                });
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
                const response = await wallet.request({ method: 'sol_signMessage', params: [message] });

                return bs58.decode(response.signature);
            } catch (error: any) {
                throw new WalletSignMessageError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
}
