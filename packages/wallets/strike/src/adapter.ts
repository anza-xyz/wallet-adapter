import type { SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
import {
    BaseSignerWalletAdapter,
    WalletConfigError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletLoadError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletReadyState,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type { Connection, PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';
import type { StrikeWallet } from '@strike-protocols/solana-wallet-adapter';

interface StrikeWindow extends Window {
    strike?: StrikeWallet;
}

declare const window: StrikeWindow;

export interface StrikeWalletAdapterConfig {}

export const StrikeWalletName = 'Strike' as WalletName<'Strike'>;

export class StrikeWalletAdapter extends BaseSignerWalletAdapter {
    name = StrikeWalletName;
    url = 'https://wallet.strikeprotocols.com';
    icon =
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjMuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAyODEuNSAyODQuNyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjgxLjUgMjg0Ljc7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDp1cmwoI1NWR0lEXzFfKTt9Cjwvc3R5bGU+CjxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfMV8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iMjM5LjczMTIiIHkxPSIxNS43NTk3IiB4Mj0iNDIuNzkzOSIgeTI9IjI2Ny44Mjc5Ij4KCTxzdG9wICBvZmZzZXQ9IjAuMTg3OSIgc3R5bGU9InN0b3AtY29sb3I6IzVENkI4NyIvPgoJPHN0b3AgIG9mZnNldD0iMC4yNTY3IiBzdHlsZT0ic3RvcC1jb2xvcjojNjA2RDg4Ii8+Cgk8c3RvcCAgb2Zmc2V0PSIwLjMwNDYiIHN0eWxlPSJzdG9wLWNvbG9yOiM2NjcyOEMiLz4KCTxzdG9wICBvZmZzZXQ9IjAuMzQ2IiBzdHlsZT0ic3RvcC1jb2xvcjojNzI3QjkzIi8+Cgk8c3RvcCAgb2Zmc2V0PSIwLjM4MzkiIHN0eWxlPSJzdG9wLWNvbG9yOiM4Mjg5OUYiLz4KCTxzdG9wICBvZmZzZXQ9IjAuNDE5MiIgc3R5bGU9InN0b3AtY29sb3I6Izk5OURBRiIvPgoJPHN0b3AgIG9mZnNldD0iMC40NTI4IiBzdHlsZT0ic3RvcC1jb2xvcjojQjdCOUM2Ii8+Cgk8c3RvcCAgb2Zmc2V0PSIwLjQ4NDMiIHN0eWxlPSJzdG9wLWNvbG9yOiNERkRGRTUiLz4KCTxzdG9wICBvZmZzZXQ9IjAuNTAwNiIgc3R5bGU9InN0b3AtY29sb3I6I0ZGRkZGRiIvPgoJPHN0b3AgIG9mZnNldD0iMC41MjE5IiBzdHlsZT0ic3RvcC1jb2xvcjojRDJEM0RBIi8+Cgk8c3RvcCAgb2Zmc2V0PSIwLjU0MzciIHN0eWxlPSJzdG9wLWNvbG9yOiNCOEI5QzQiLz4KCTxzdG9wICBvZmZzZXQ9IjAuNTU3OCIgc3R5bGU9InN0b3AtY29sb3I6I0FGQjFCRCIvPgoJPHN0b3AgIG9mZnNldD0iMC41ODM1IiBzdHlsZT0ic3RvcC1jb2xvcjojQTFBNEIzIi8+Cgk8c3RvcCAgb2Zmc2V0PSIwLjY0MTUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4ODhEQTEiLz4KCTxzdG9wICBvZmZzZXQ9IjAuNyIgc3R5bGU9InN0b3AtY29sb3I6Izc2N0Q5NSIvPgoJPHN0b3AgIG9mZnNldD0iMC43NTg1IiBzdHlsZT0ic3RvcC1jb2xvcjojNjg3MzhEIi8+Cgk8c3RvcCAgb2Zmc2V0PSIwLjgxNzEiIHN0eWxlPSJzdG9wLWNvbG9yOiM2MDZEODgiLz4KCTxzdG9wICBvZmZzZXQ9IjAuODc1OCIgc3R5bGU9InN0b3AtY29sb3I6IzVENkI4NyIvPgo8L2xpbmVhckdyYWRpZW50Pgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTQyLjUsMTExLjdjNTcuOSwzLjgsMTM5LjIsOS4xLDEzOS4xLDc3LjFjMCw3Ny41LTY3LjksOTUuOS0xNDAuOCw5NS45Yy03Mi43LTAuMi0xMzAuMS0xMC0xNDAuNC05Mi41bDAsMAoJYzYuMSwzLjUsMTQuNyw4LDE4LjksMTAuMmM0NCwyMy40LDEzMy4xLDEyLjEsMTMzLjEsMTIuMWwtMC40LDI1LjFsNTguNy00My45bC01Ny43LTQzLjlsLTAuNCwyMi4xYzAsMC05LTAuNi0xMy40LTAuOQoJQzgxLjIsMTY5LjItMC4yLDE2NCwwLDk2LjFDMCwxOC42LDY3LjksMCwxNDAuOCwwYzcyLjcsMC42LDEzMyw3LjYsMTQwLjgsOTIuNWwwLDBjLTU1LjctNDIuMS0xNTcuMS0yNS4zLTE1Ny4xLTI1LjNsMC40LTI1LjEKCUw2Ni4xLDg1LjlsNTcuNyw0My45bC0wLjMtMTkuNUMxMjMuNSwxMTAuNCwxMzQuMywxMTEuMiwxNDIuNSwxMTEuN3oiLz4KPC9zdmc+Cg==';
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: StrikeWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.Loadable;

    constructor(config: StrikeWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
    }

    get publicKey() {
        return this._publicKey;
    }

    get connecting() {
        return this._connecting;
    }

    get connected() {
        return !!this._wallet?.isLoggedIn;
    }

    get readyState() {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Loadable) throw new WalletNotReadyError();

            this._connecting = true;

            let StrikeClass: typeof StrikeWallet;
            try {
                StrikeClass = (await import('@strike-protocols/solana-wallet-adapter')).StrikeWallet;
            } catch (error: any) {
                throw new WalletLoadError(error?.message, error);
            }

            let wallet: StrikeWallet;
            try {
                wallet = window.strike || new StrikeClass();
            } catch (error: any) {
                throw new WalletConfigError(error?.message, error);
            }

            let publicKey: PublicKey;
            try {
                publicKey = await wallet.connect(this.url);
            } catch (error: any) {
                throw new WalletConnectionError(error?.message, error);
            }

            wallet.on('disconnect', this._disconnected);

            this._wallet = wallet;
            this._publicKey = publicKey;

            this.emit('connect', this._publicKey);
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
                if (wallet.isLoggedIn) await wallet.cleanUp();
            } catch (error: any) {
                this.emit('error', new WalletDisconnectionError(error?.message, error));
            }
        }

        this.emit('disconnect');
    }

    async sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return await wallet.sendTransaction(transaction, connection, options);
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
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
