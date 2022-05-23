import {
    BaseMessageSignerWalletAdapter,
    EventEmitter,
    scopePollingDetectionStrategy,
    SendTransactionOptions,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletError,
    WalletName,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignTransactionError,
    WalletWindowClosedError,
} from '@solana/wallet-adapter-base';
import { Connection, PublicKey, SendOptions, Transaction, TransactionSignature } from '@solana/web3.js';

interface VesselWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface VesselWallet extends EventEmitter<VesselWalletEvents> {
    isVessel?: boolean;
    publicKey?: { toBytes(): Uint8Array };
    isConnected: boolean;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signAndSendTransaction(
        transaction: Transaction,
        options?: SendOptions
    ): Promise<{ signature: TransactionSignature }>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    _handleDisconnect(...args: unknown[]): unknown;
}

interface VesselWindow extends Window {
    vessel?: { solana?: VesselWallet };
}

declare const window: VesselWindow;

export interface VesselWalletAdapterConfig {}

export const VesselWalletName = 'Vessel' as WalletName<'Vessel'>;

export class VesselWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = VesselWalletName;
    url = 'https://vessel.xyz';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTU4IiBoZWlnaHQ9IjE0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTg3LjI5NiAyMC43NjJjLTI4LjMyMyAwLTU2Ljg2NiAyNi4zNTUtNDcuNjQgNjMuMDdsLTQuOTMgMS4yMzhjLTEwLjE0OC00MC4zOSAyMS40MzUtNjkuMzkgNTIuNTctNjkuMzkgMzMuMTY4IDAgNjQuMDk0IDMwLjM3IDUyLjg4NyA3MC40NDNsLTQuODk1LTEuMzY4YzEwLjE3Mi0zNi4zNzEtMTcuNjkyLTYzLjk5My00Ny45OTItNjMuOTkzWiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNODcuMjcyIDUuNTQzYy00MC43NCAwLTc1LjAzNiAzOC4wNTUtNjAuNjMgOTAuNDk3bC00LjkgMS4zNDZDNi40OTMgNDEuODc4IDQzLjAwMy40NjEgODcuMjcyLjQ2MWM0Ny4wNDQgMCA4Ni4zNiA0OC4xMDkgNjIuODAzIDEwMC42MDRsLTQuNjM3LTIuMDhjMjEuOTE0LTQ4LjgzMy0xNC40NzItOTMuNDQyLTU4LjE2Ni05My40NDJaIiBmaWxsPSIjZmZmIi8+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik02MC4zOTEgNDkuOTQ1Yy01LjQ4MyA3LjYwOC03LjM3NSAxNi45MzItNi4zNjcgMjMuNzAzYTIuNTQxIDIuNTQxIDAgMSAxLTUuMDI2Ljc0OWMtMS4yMTEtOC4xMyAxLjA0MS0xOC43ODIgNy4yNy0yNy40MjQgNi4zMDctOC43NSAxNi42OTYtMTUuNDQyIDMxLjU4NC0xNS40NDIgMTIuODQyIDAgMjMuMzMyIDYuMzE1IDMwLjAyNSAxNS4wMjMgNi42NiA4LjY2MyA5LjcwNSAxOS44ODMgNy40NTMgMjkuOTI3YTIuNTQgMi41NCAwIDEgMS00Ljk1OS0xLjExMmMxLjg3MS04LjM0NS0uNjMtMTguMDUyLTYuNTIzLTI1LjcxOC01Ljg1OS03LjYyMS0xNC45My0xMy4wMzgtMjUuOTk2LTEzLjAzOC0xMy4xNjMgMC0yMi4wNTUgNS44MzItMjcuNDYgMTMuMzMyWiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTQ5LjU0MSAxMTAuNjgxYy0uMTI3LTIzLjEzOC0yNi42MDktMzMuOTM2LTI2LjYwOS0zMy45MzZoLTE4LjE1NWwtNy4xMzQtMTQuODQ3SDc2LjgybC03LjEzNCAxNC44NDdINTAuNDMzTDMwLjM4IDkxLjA5MiAxNy42NTQgNzYuNzQ1SDNsMTAuMDI3IDI2Ljc2M0wzIDExMC42ODFsMTAuMDI3IDcuMjU1TDMgMTQ1LjAwM2gxNC42NTRsMTIuNzI2LTE0LjUxIDIwLjA1MyAxNC41MWg3Mi40OTlzMjYuNzM2LTExLjE4NCAyNi42MDktMzQuMzIyWm0tOTIuOTUyIDkuNjVjNS40MzEgMCA5LjgzNC00LjQwMyA5LjgzNC05LjgzNHMtNC40MDMtOS44MzQtOS44MzQtOS44MzRjLTUuNDMgMC05LjgzNCA0LjQwMy05LjgzNCA5LjgzNHM0LjQwMyA5LjgzNCA5LjgzNCA5LjgzNFptNDAuODEtOS44MzRjMCA1LjQzMS00LjQwMiA5LjgzNC05LjgzMyA5LjgzNC01LjQzIDAtOS44MzQtNC40MDMtOS44MzQtOS44MzRzNC40MDMtOS44MzQgOS44MzQtOS44MzQgOS44MzQgNC40MDMgOS44MzQgOS44MzRabTIxLjI0IDkuODM0YzUuNDMxIDAgOS44MzMtNC40MDMgOS44MzMtOS44MzRzLTQuNDAyLTkuODM0LTkuODMzLTkuODM0LTkuODM0IDQuNDAzLTkuODM0IDkuODM0IDQuNDAzIDkuODM0IDkuODM0IDkuODM0WiIgZmlsbD0idXJsKCNhKSIvPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNODQuNjkgNDguNjYyYTIuNTQxIDIuNTQxIDAgMCAxIDIuNTQxLTIuNTRoOS45MzhhMi41NDEgMi41NDEgMCAxIDEgMCA1LjA4MWgtNy4zOTd2OC4xNTNoNy44NzFjLjk3NyAwIDEuODY3LjU2IDIuMjkgMS40NGw2LjQ0MyAxMy40MDdoMTYuNTU2Yy4zMjkgMCAuNjU1LjA2NC45Ni4xODhsLS45NiAyLjM1M2MuOTYtMi4zNTMuOTYxLTIuMzUzLjk2Mi0yLjM1MmwuMDAyLjAwMS4wMDcuMDAzLjAyMi4wMDkuMDcxLjAzYy4wNTkuMDI1LjE0NC4wNi4yNTEuMTA3LjIxNC4wOTQuNTIuMjMuOTA0LjQxMi43NjkuMzYgMS44NTQuODk4IDMuMTUgMS42MTUgMi41ODggMS40MyA2LjA0OSAzLjU5NCA5LjUyNSA2LjUyMyA2LjkxNyA1LjgyOCAxNC4xODcgMTQuOTUxIDE0LjI1NiAyNy41NzQuMDY5IDEyLjYzNi03LjIwOCAyMS44NjQtMTQuMTQ5IDI3Ljc4NS0zLjQ5IDIuOTc3LTYuOTczIDUuMTg4LTkuNTc5IDYuNjU2YTU1LjgzMSA1NS44MzEgMCAwIDEtMy4xNzMgMS42NTkgNDIuODQ4IDQyLjg0OCAwIDAgMS0xLjE2NC41MzVsLS4wNzEuMDMxLS4wMjIuMDA5LS4wMDcuMDAzLS4wMDIuMDAxYy0uMDAxIDAtLjAwMiAwLS45ODMtMi4zNDRsLjk4MSAyLjM0NGMtLjMxMS4xMy0uNjQ0LjE5Ny0uOTgxLjE5N0g1MC40MzNhMi41NDUgMi41NDUgMCAwIDEtMS40OS0uNDgybC0xOC4xNzgtMTMuMTU0LTExLjIgMTIuNzcxYTIuNTQxIDIuNTQxIDAgMCAxLTEuOTEuODY1SDNhMi41NDIgMi41NDIgMCAwIDEtMi4zODMtMy40MjNsOS4zNTYtMjUuMjU3LTguNDYzLTYuMTIzYTIuNTQyIDIuNTQyIDAgMCAxIC4wMTItNC4xMjZsOC40NDEtNi4wMzlMLjYyMSA3Ny42MzZBMi41NDEgMi41NDEgMCAwIDEgMyA3NC4yMDNoMTQuNjU0Yy43MjcgMCAxLjQxOS4zMTEgMS45MDEuODU1bDExLjIwNyAxMi42MzUgMTguMTkzLTEzLjAxNmEyLjU0MSAyLjU0MSAwIDAgMSAxLjQ3OC0uNDc0aDE3LjY1NGw2LjQ0Mi0xMy40MDZhMi41NDEgMi41NDEgMCAwIDEgMi4yOS0xLjQ0aDcuODcxVjQ4LjY2MVptLTYuMjczIDE1Ljc3Ni00LjY5MiA5Ljc2NWgyNy4wMTJsLTQuNjkyLTkuNzY1SDc4LjQxN1pNNTEuMjQ4IDc5LjI4NWwtMzYuNzQzIDI2LjI4OC0uMDAxLjAwMS03LjE1MyA1LjExOCA3LjE2NSA1LjE4NC4wMDIuMDAxIDE3LjM0NyAxMi41NTIuMDA1LjAwNCAxOS4zODYgMTQuMDI3aDcxLjEzOGMuMTU4LS4wNzIuMzU1LS4xNjQuNTg3LS4yNzUuNjg3LS4zMyAxLjY4MS0uODMyIDIuODgtMS41MDcgMi40MDMtMS4zNTMgNS41OTYtMy4zODMgOC43NzQtNi4wOTQgNi4zOTUtNS40NTUgMTIuNDIyLTEzLjM4OCAxMi4zNjUtMjMuODktLjA1OC0xMC41MTYtNi4wOTMtMTguMzYtMTIuNDQ4LTIzLjcxNi0zLjE2LTIuNjYyLTYuMzI4LTQuNjQ1LTguNzEtNS45NjJhNDguOTU1IDQ4Ljk1NSAwIDAgMC0yLjg1My0xLjQ2MyAzMy43MTIgMzMuNzEyIDAgMCAwLS41ODMtLjI2OEg1MS4yNDhaTTI2LjYzIDEzMC45MTRsLTEyLjM4My04Ljk1OS03LjU5NiAyMC41MDVoOS44NTJsMTAuMTI3LTExLjU0NlpNMTQuMjQyIDk5LjUxMmwxMi4zNjQtOC44NDYtMTAuMDk2LTExLjM4SDYuNjY2bDcuNTc3IDIwLjIyNVptNDIuMzQ2IDMuNjkxYTcuMjkzIDcuMjkzIDAgMSAwIDAgMTQuNTg2IDcuMjkzIDcuMjkzIDAgMCAwIDAtMTQuNTg2Wm0tMTIuMzc1IDcuMjkzYzAtNi44MzUgNS41NC0xMi4zNzUgMTIuMzc1LTEyLjM3NSA2LjgzNCAwIDEyLjM3NSA1LjU0IDEyLjM3NSAxMi4zNzUgMCA2LjgzNC01LjU0IDEyLjM3NC0xMi4zNzUgMTIuMzc0LTYuODM0IDAtMTIuMzc1LTUuNTQtMTIuMzc1LTEyLjM3NFptMzAuOTc3IDBjMC02LjgzNSA1LjU0LTEyLjM3NSAxMi4zNzUtMTIuMzc1IDYuODM0IDAgMTIuMzc1IDUuNTQgMTIuMzc1IDEyLjM3NSAwIDYuODM0LTUuNTQgMTIuMzc0LTEyLjM3NSAxMi4zNzQtNi44MzQgMC0xMi4zNzUtNS41NC0xMi4zNzUtMTIuMzc0Wm0xMi4zNzUtNy4yOTNhNy4yOTMgNy4yOTMgMCAxIDAgMCAxNC41ODUgNy4yOTMgNy4yOTMgMCAwIDAgMC0xNC41ODVabTMxLjA3MyAwYTcuMjkzIDcuMjkzIDAgMSAwIDAgMTQuNTg2IDcuMjkzIDcuMjkzIDAgMCAwIDAtMTQuNTg2Wm0tMTIuMzc1IDcuMjkzYzAtNi44MzUgNS41NC0xMi4zNzUgMTIuMzc1LTEyLjM3NSA2LjgzNCAwIDEyLjM3NCA1LjU0IDEyLjM3NCAxMi4zNzUgMCA2LjgzNC01LjU0IDEyLjM3NC0xMi4zNzQgMTIuMzc0LTYuODM1IDAtMTIuMzc1LTUuNTQtMTIuMzc1LTEyLjM3NFoiIGZpbGw9IiNmZmYiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSI3Ni40NzciIHkxPSI1Ni45MDMiIHgyPSI2OS4wNDYiIHkyPSIxNTMuOTU5IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iI0ZGRkY4MiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0ZGOTlCNCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==';

    private _connecting: boolean;
    private _wallet: VesselWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: VesselWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.vessel?.solana?.isVessel) {
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

    get connected(): boolean {
        return !!this._wallet?.isConnected;
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
            const wallet = window!.vessel!.solana!;

            if (!wallet.isConnected) {
                // HACK: Vessel doesn't reject or emit an event if the popup is closed
                const handleDisconnect = wallet._handleDisconnect;
                try {
                    await new Promise<void>((resolve, reject) => {
                        const connect = () => {
                            wallet.off('connect', connect);
                            resolve();
                        };

                        wallet._handleDisconnect = (...args: unknown[]) => {
                            wallet.off('connect', connect);
                            reject(new WalletWindowClosedError());
                            return handleDisconnect.apply(wallet, args);
                        };

                        wallet.on('connect', connect);

                        wallet.connect().catch((reason: any) => {
                            wallet.off('connect', connect);
                            reject(reason);
                        });
                    });
                } catch (error: any) {
                    if (error instanceof WalletError) throw error;
                    throw new WalletConnectionError(error?.message, error);
                } finally {
                    wallet._handleDisconnect = handleDisconnect;
                }
            }

            if (!wallet.publicKey) throw new WalletAccountError();

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(wallet.publicKey.toBytes());
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            wallet.on('disconnect', this._disconnected);

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
            wallet.off('disconnect', this._disconnected);

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

    async sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options?: SendTransactionOptions
    ): Promise<TransactionSignature> {
        try {
            const wallet = this._wallet;
            if (wallet && 'signAndSendTransaction' in wallet && !options?.signers) {
                // Set reasonable defaults for feePayer and recentBlockhash in the transaction
                transaction.feePayer = transaction.feePayer || this.publicKey || undefined;
                transaction.recentBlockhash =
                    transaction.recentBlockhash || (await connection.getRecentBlockhash('finalized')).blockhash;

                const { signature } = await wallet.signAndSendTransaction(transaction, options);
                return signature;
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }

        return await super.sendTransaction(transaction, connection, options);
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

    private _disconnected = () => {
        const wallet = this._wallet;
        if (wallet) {
            wallet.off('disconnect', this._disconnected);

            this._wallet = null;
            this._publicKey = null;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };
}
