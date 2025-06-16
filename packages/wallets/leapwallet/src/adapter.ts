import type { SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import {
    SendOptions,
    Transaction,
    TransactionSignature,
    TransactionVersion,
    VersionedTransaction,
} from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

interface SolanaLeap {
    publicKey: PublicKey;
    connect(): Promise<PublicKey>;
    disconnect(): Promise<void>;
    signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<Uint8Array<ArrayBufferLike>>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(
        transactions: T[]
    ): Promise<Uint8Array<ArrayBufferLike>[]>;
    signAndSendTransaction<T extends Transaction | VersionedTransaction>(
        transaction: T,
        options?: SendOptions
    ): Promise<TransactionSignature>;
    signMessage(msg: string): Promise<{ signature: Uint8Array }>;
}

interface LeapWindow extends Window {
    leap?: {
        solana?: SolanaLeap;
    };
}

export const LeapWalletName = 'Leap Wallet' as WalletName<'Leap Wallet'>;

declare const window: LeapWindow;

export class LeapWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = LeapWalletName;
    url = 'https://leapwallet.io';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTY2IiBoZWlnaHQ9IjE2NiIgdmlld0JveD0iMCAwIDE2NiAxNjYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF83ODBfNjEwKSI+CjxyZWN0IHdpZHRoPSIxNjYiIGhlaWdodD0iMTY2IiBmaWxsPSIjQzVGRkNFIi8+CjxwYXRoIGQ9Ik0xMzguNjE0IDEwMC40NDVDMTM4LjYxNCAxMjAuMjE3IDExNC40ODMgMTI4LjI1MiA4NC41MjE2IDEyOC4yNTJDNTQuNTYwMyAxMjguMjUyIDMwLjA3ODQgMTIwLjIxNyAzMC4wNzg0IDEwMC40NDVDMzAuMDc4NCA4MC42NzI0IDU0LjM4NDYgNjQuNjczIDg0LjM0NiA2NC42NzNDMTE0LjMwNyA2NC42NzMgMTM4LjYxNCA4MC43MDc0IDEzOC42MTQgMTAwLjQ0NVoiIGZpbGw9IiMyNEE5NUEiLz4KPHBhdGggZD0iTTEzMy4xMDMgNTcuMzQ3MkMxMzMuMTAzIDQ2LjkzNyAxMjQuNjAzIDM4LjQ4MzIgMTE0LjEzNiAzOC40ODMyQzEwOC42OTMgMzguNDgzMiAxMDMuNzg3IDQwLjc3MTkgMTAwLjMzIDQ0LjQxNzFDOTkuNzk0NCA0NC45ODE4IDk5LjAxMTggNDUuMjU2OSA5OC4yNDkgNDUuMTAyOUM5My44NjkgNDQuMjE4NSA4OS4yMzU1IDQzLjcyMzIgODQuNDU1NSA0My43MjMyQzc5LjY3NiA0My43MjMyIDc1LjA0MyA0NC4xODkzIDcwLjY2MzQgNDUuMDk1QzY5Ljg5OTggNDUuMjUyOSA2OS4xMTM4IDQ0Ljk4MjMgNjguNTc1IDQ0LjQxODZDNjUuMDkgNDAuNzcyNSA2MC4xODY3IDM4LjQ4MzIgNTQuNzc1MiAzOC40ODMyQzQ0LjMwOCAzOC40ODMyIDM1LjgwNzkgNDYuOTM3IDM1LjgwNzkgNTcuMzQ3MkMzNS44MDc5IDYwLjM4MzQgMzYuNTI2MiA2My4yMjczIDM3Ljc5MTMgNjUuNzU3QzM4LjA5NDMgNjYuMzYyOCAzOC4xMjQ4IDY3LjA3MjEgMzcuODYyNyA2Ny42OTY2QzM2LjYzNTMgNzAuNjIxMiAzNS45ODM1IDczLjcwOTEgMzUuOTgzNSA3Ni45MDk4QzM1Ljk4MzUgOTUuMjQ5OCA1Ny42OTA1IDExMC4wOTYgODQuNDU1NSAxMTAuMDk2QzExMS4yMjEgMTEwLjA5NiAxMzIuOTI4IDk1LjI0OTggMTMyLjkyOCA3Ni45MDk4QzEzMi45MjggNzMuNzA5MSAxMzIuMjc2IDcwLjYyMTIgMTMxLjA0OCA2Ny42OTY2QzEzMC43ODYgNjcuMDcyMSAxMzAuODE3IDY2LjM2MjggMTMxLjEyIDY1Ljc1N0MxMzIuMzg1IDYzLjIyNzMgMTMzLjEwMyA2MC4zODM0IDEzMy4xMDMgNTcuMzQ3MloiIGZpbGw9IiMzMkRBNkQiLz4KPHBhdGggZD0iTTUzLjIyNzEgNjcuODExOUM1OS42Mjg3IDY3LjgxMTkgNjQuODE4MyA2Mi42NTA2IDY0LjgxODMgNTYuMjgzOUM2NC44MTgzIDQ5LjkxNzEgNTkuNjI4NyA0NC43NTU5IDUzLjIyNzEgNDQuNzU1OUM0Ni44MjU1IDQ0Ljc1NTkgNDEuNjM2IDQ5LjkxNzEgNDEuNjM2IDU2LjI4MzlDNDEuNjM2IDYyLjY1MDYgNDYuODI1NSA2Ny44MTE5IDUzLjIyNzEgNjcuODExOVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMTUuMDY1IDY3LjgxMTlDMTIxLjQ2NiA2Ny44MTE5IDEyNi42NTYgNjIuNjUwNiAxMjYuNjU2IDU2LjI4MzlDMTI2LjY1NiA0OS45MTcxIDEyMS40NjYgNDQuNzU1OSAxMTUuMDY1IDQ0Ljc1NTlDMTA4LjY2MyA0NC43NTU5IDEwMy40NzQgNDkuOTE3MSAxMDMuNDc0IDU2LjI4MzlDMTAzLjQ3NCA2Mi42NTA2IDEwOC42NjMgNjcuODExOSAxMTUuMDY1IDY3LjgxMTlaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNDcuMDc1OSAxMjYuODI5QzQ5LjU2OTggMTI2LjgyOSA1MS41MzY4IDEyNC42NjMgNTEuMjU1OCAxMjIuMjE4QzUwLjIzNzIgMTEzLjU1NCA0NS45MTY4IDk0Ljc5NSAyNi45MTQ0IDgzLjUxMTVDNi4wODM2OCA3MS4xMzg3IDE1Ljk5NDEgMTA0LjAzNCAyMC4xMzY1IDExNi4wMTlDMjAuOTc0NCAxMTguNDQzIDIwLjAwMjcgMTIxLjEzNSAxNy43NzgzIDEyMi40MTFMMTYuNDEyMSAxMjMuMTk2QzE0LjY1NTkgMTI0LjIwOSAxNS4zOTM1IDEyNi44MjkgMTcuMzk1NiAxMjYuODI5SDQ3LjA3NTlaIiBmaWxsPSIjMzJEQTZEIi8+CjxwYXRoIGQ9Ik0xMjIuNTY2IDEyNi44MjlDMTIwLjMxOCAxMjYuODI5IDExOC41NjIgMTI0LjY2MyAxMTguODA4IDEyMi4yMThDMTE5LjY4NiAxMTMuNTg5IDEyMy42MiA5NC43OTUgMTQwLjc2MSA4My41MTE1QzE1OS43NDEgNzEuMDQyNiAxNTAuNTAzIDEwNC41NDcgMTQ2LjgxNSAxMTYuMjk0QzE0Ni4wOTIgMTE4LjU5OCAxNDYuOTgyIDEyMS4xMDYgMTQ5LjAyMiAxMjIuMzk5TDE1MC4yOCAxMjMuMTk2QzE1MS44NiAxMjQuMjA5IDE1MS4xOTMgMTI2LjgyOSAxNDkuNDAyIDEyNi44MjlIMTIyLjU2NloiIGZpbGw9IiMzMkRBNkQiLz4KPHBhdGggZD0iTTUzLjI0MjggNjMuMTc4N0M1Ny4wNjE3IDYzLjE3ODcgNjAuMTU3NiA2MC4wODI4IDYwLjE1NzYgNTYuMjYzOUM2MC4xNTc2IDUyLjQ0NSA1Ny4wNjE3IDQ5LjM0OTEgNTMuMjQyOCA0OS4zNDkxQzQ5LjQyMzkgNDkuMzQ5MSA0Ni4zMjggNTIuNDQ1IDQ2LjMyOCA1Ni4yNjM5QzQ2LjMyOCA2MC4wODI4IDQ5LjQyMzkgNjMuMTc4NyA1My4yNDI4IDYzLjE3ODdaIiBmaWxsPSIjMDkyNTExIi8+CjxwYXRoIGQ9Ik0xMTUuMDgxIDYzLjE3ODdDMTE4LjkgNjMuMTc4NyAxMjEuOTk1IDYwLjA4MjggMTIxLjk5NSA1Ni4yNjM5QzEyMS45OTUgNTIuNDQ1IDExOC45IDQ5LjM0OTEgMTE1LjA4MSA0OS4zNDkxQzExMS4yNjIgNDkuMzQ5MSAxMDguMTY2IDUyLjQ0NSAxMDguMTY2IDU2LjI2MzlDMTA4LjE2NiA2MC4wODI4IDExMS4yNjIgNjMuMTc4NyAxMTUuMDgxIDYzLjE3ODdaIiBmaWxsPSIjMDkyNTExIi8+CjxwYXRoIGQ9Ik05OS43OTk1IDgzLjAxNzZDMTAxLjUxNCA4My4xNjUxIDEwMi44MSA4NC42ODYyIDEwMi4zNzggODYuMzUxOEMxMDIuMDI5IDg3LjY5NzkgMTAxLjUyOSA4OS4wMDM5IDEwMC44ODYgOTAuMjQ0MkM5OS43NjMgOTIuNDA5IDk4LjIyNDYgOTQuMzMxNSA5Ni4zNTg2IDk1LjkwMThDOTQuNDkyNyA5Ny40NzIyIDkyLjMzNTcgOTguNjU5NiA5MC4wMTA4IDk5LjM5NjNDODcuNjg2IDEwMC4xMzMgODUuMjM4OCAxMDAuNDA1IDgyLjgwOSAxMDAuMTk2QzgwLjM3OTEgOTkuOTg2NiA3OC4wMTQzIDk5LjMwMSA3NS44NDk0IDk4LjE3OEM3My42ODQ2IDk3LjA1NTEgNzEuNzYyMSA5NS41MTY3IDcwLjE5MTcgOTMuNjUwN0M2OC42MjE0IDkxLjc4NDggNjcuNDM0IDg5LjYyNzggNjYuNjk3MiA4Ny4zMDI5QzY2LjE3MDEgODUuNjM5NiA2NS44ODExIDgzLjkxMzUgNjUuODM1OSA4Mi4xNzYxQzY1LjgwNiA4MS4wMjk0IDY2LjgyNDQgODAuMTgwOCA2Ny45NjczIDgwLjI3OTFMODQuNDAwNyA4MS42OTI4TDk5Ljc5OTUgODMuMDE3NloiIGZpbGw9IiMwOTI1MTEiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF83ODBfNjEwIj4KPHJlY3Qgd2lkdGg9IjE2NiIgaGVpZ2h0PSIxNjYiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==';
    readonly supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0]);

    private _connecting: boolean;
    private _publicKey: PublicKey | null;
    private _wallet: SolanaLeap | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor() {
        super();
        this._connecting = false;
        this._publicKey = null;
        this._wallet = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window?.leap?.solana) {
                    this._readyState = WalletReadyState.Installed;
                    this.emit('readyStateChange', this._readyState);
                    return true;
                }
                return false;
            });
        }
    }

    get connecting() {
        return this._connecting;
    }

    get readyState() {
        return this._readyState;
    }

    get publicKey() {
        return this._publicKey;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this._connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const wallet = window.leap!.solana!;

            try {
                await wallet.connect();
            } catch (error: any) {
                throw new WalletConnectionError(error?.message, error);
            }

            if (wallet.publicKey.toString() === '11111111111111111111111111111111') throw new WalletAccountError();

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(wallet.publicKey.toBytes());
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
                this.emit('error', new WalletDisconnectedError());
            }
        }

        this.emit('disconnect');
    }

    async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();
            const isVersionedTransaction = transaction instanceof VersionedTransaction;

            try {
                const signedTransaction = await wallet.signTransaction(transaction);
                return (
                    isVersionedTransaction
                        ? VersionedTransaction.deserialize(signedTransaction)
                        : Transaction.from(signedTransaction)
                ) as T;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signAndSendTransaction<T extends Transaction | VersionedTransaction>(
        transaction: T,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return await wallet.signAndSendTransaction(transaction, options);
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const signedTransactions = await wallet.signAllTransactions(transactions);
                return signedTransactions.map((transaction) => {
                    return transaction instanceof VersionedTransaction
                        ? VersionedTransaction.deserialize(transaction)
                        : Transaction.from(transaction);
                }) as T[];
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
                const { signature } = await wallet.signMessage(new TextDecoder().decode(message));
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
