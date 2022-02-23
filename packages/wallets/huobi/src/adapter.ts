import {
    BaseMessageSignerWalletAdapter,
    EventEmitter,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletName,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';

interface HuobiWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface HuobiWallet extends EventEmitter<HuobiWalletEvents> {
    isHuobiWallet?: boolean;
    publicKey?: { toBytes(): Uint8Array };
    isConnected: boolean;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

interface HuobiWalletWindow extends Window {
    huobiWallet?: HuobiWallet;
}

declare const window: HuobiWalletWindow;

export interface HuobiWalletAdapterConfig {}

export const HuobiWalletName = 'HuobiWallet' as WalletName;

export class HuobiWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = HuobiWalletName;
    url = 'https://www.huobiwallet.io';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjI0IiBoZWlnaHQ9IjIyNCIgdmlld0JveD0iMCAwIDIyNCAyMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMCAwTDIyNCAwVjIyNEgwTDAgMFoiIGZpbGw9IiMyMTU3RTIiLz4KPHBhdGggZD0iTTEzMS4wNTkgODEuMTc3MUMxMzEuMDU5IDU3Ljc1MzEgMTE5LjQ1OCAzNy42MzE1IDExMC42MjUgMzEuMDcyOEMxMTAuNjI1IDMxLjA3MjggMTA5Ljk1MyAzMC43MDQyIDExMCAzMS42MjU4VjMxLjYyNThDMTA5LjI2NSA3Ni44MzAzIDg1Ljc2NzIgODkuMDg3NSA3Mi44MzggMTA1LjU4NEM0My4wMjQxIDE0My42NzcgNzAuNzU4NyAxODUuNDU2IDk4Ljk5MzUgMTkzLjEzNkMxMTQuNzk5IDE5Ny40NTIgOTUuMzUwOCAxODUuNDU2IDkyLjg0OTQgMTYwLjIzNUM4OS44MDA3IDEyOS43NDUgMTMxLjA1OSAxMDYuNDQ0IDEzMS4wNTkgODEuMTc3MVoiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8xMTAxXzEyNSkiLz4KPHBhdGggZD0iTTE0My41OTcgOTYuMzE3NEMxNDMuNDA5IDk2LjE5NDMgMTQzLjE1OCA5Ni4xMDIgMTQyLjk4NiA5Ni4zOTQzQzE0Mi40ODQgMTAyLjEwMiAxMzYuNTYgMTE0LjI4NiAxMjkuMDM3IDEyNS40ODZDMTAzLjU1MiAxNjMuNDU1IDExOC4wNjUgMTgxLjc2MiAxMjYuMjQ3IDE5MS42MzlDMTMwLjk0OSAxOTcuMzQ3IDEyNi4yNDcgMTkxLjYzOSAxMzguMDk2IDE4NS44MDhDMTUyLjczNSAxNzcuMDkyIDE2Mi4yMzQgMTYyLjAyIDE2My42NDMgMTQ1LjI3QzE2NS4yMzMgMTI2Ljc1OCAxNTcuNzk4IDEwOC42IDE0My41OTcgOTYuMzE3NFoiIGZpbGw9InVybCgjcGFpbnQxX2xpbmVhcl8xMTAxXzEyNSkiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xMTAxXzEyNSIgeDE9IjEyMi40MDEiIHkxPSIyMDkuMjk1IiB4Mj0iMTc4LjY2MiIgeTI9IjExMC40NDciIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0Y3RjZGRiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IndoaXRlIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQxX2xpbmVhcl8xMTAxXzEyNSIgeDE9IjE1Ny44NjEiIHkxPSIyMDMuMTc3IiB4Mj0iMTg5LjAxNCIgeTI9IjE0MC4wMjIiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0Y3RjZGRiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IndoaXRlIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==';

    private _connecting: boolean;
    private _wallet: HuobiWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: HuobiWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.huobiWallet?.isHuobiWallet) {
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
            const wallet = window!.huobiWallet!;

            try {
                await wallet.connect();
            } catch (error: any) {
                throw new WalletConnectionError(error?.message, error);
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

            this.emit('disconnect');
        }
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
