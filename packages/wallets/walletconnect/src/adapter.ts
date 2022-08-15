import {
    BaseSignerWalletAdapter,
    WalletAdapterNetwork,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletLoadError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignMessageError,
    WalletSignTransactionError,
    WalletWindowClosedError,
} from '@solana/wallet-adapter-base';
import type { WalletName } from '@solana/wallet-adapter-base';
import type { Transaction } from '@solana/web3.js';
import type { PublicKey } from '@solana/web3.js';

import type {
    WalletConnectWalletAdapterConfig,
    WalletConnectWallet,
    WalletConnectChainID,
    WalletConnectClient,
    QRCodeModalError,
} from '@jnwng/walletconnect-solana';

export const WalletConnectWalletName = 'WalletConnect' as WalletName;

export class WalletConnectWalletAdapter extends BaseSignerWalletAdapter {
    name = WalletConnectWalletName;
    url = 'https://walletconnect.org';
    icon =
        'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE4NSIgdmlld0JveD0iMCAwIDMwMCAxODUiIHdpZHRoPSIzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTYxLjQzODU0MjkgMzYuMjU2MjYxMmM0OC45MTEyMjQxLTQ3Ljg4ODE2NjMgMTI4LjIxMTk4NzEtNDcuODg4MTY2MyAxNzcuMTIzMjA5MSAwbDUuODg2NTQ1IDUuNzYzNDE3NGMyLjQ0NTU2MSAyLjM5NDQwODEgMi40NDU1NjEgNi4yNzY1MTEyIDAgOC42NzA5MjA0bC0yMC4xMzY2OTUgMTkuNzE1NTAzYy0xLjIyMjc4MSAxLjE5NzIwNTEtMy4yMDUzIDEuMTk3MjA1MS00LjQyODA4MSAwbC04LjEwMDU4NC03LjkzMTE0NzljLTM0LjEyMTY5Mi0zMy40MDc5ODE3LTg5LjQ0Mzg4Ni0zMy40MDc5ODE3LTEyMy41NjU1Nzg4IDBsLTguNjc1MDU2MiA4LjQ5MzYwNTFjLTEuMjIyNzgxNiAxLjE5NzIwNDEtMy4yMDUzMDEgMS4xOTcyMDQxLTQuNDI4MDgwNiAwbC0yMC4xMzY2OTQ5LTE5LjcxNTUwMzFjLTIuNDQ1NTYxMi0yLjM5NDQwOTItMi40NDU1NjEyLTYuMjc2NTEyMiAwLTguNjcwOTIwNHptMjE4Ljc2Nzc5NjEgNDAuNzczNzQ0OSAxNy45MjE2OTcgMTcuNTQ2ODk3YzIuNDQ1NTQ5IDIuMzk0Mzk2OSAyLjQ0NTU2MyA2LjI3NjQ3NjkuMDAwMDMxIDguNjcwODg5OWwtODAuODEwMTcxIDc5LjEyMTEzNGMtMi40NDU1NDQgMi4zOTQ0MjYtNi40MTA1ODIgMi4zOTQ0NTMtOC44NTYxNi4wMDAwNjItLjAwMDAxLS4wMDAwMS0uMDAwMDIyLS4wMDAwMjItLjAwMDAzMi0uMDAwMDMybC01Ny4zNTQxNDMtNTYuMTU0NTcyYy0uNjExMzktLjU5ODYwMi0xLjYwMjY1LS41OTg2MDItMi4yMTQwNCAwLS4wMDAwMDQuMDAwMDA0LS4wMDAwMDcuMDAwMDA4LS4wMDAwMTEuMDAwMDExbC01Ny4zNTI5MjEyIDU2LjE1NDUzMWMtMi40NDU1MzY4IDIuMzk0NDMyLTYuNDEwNTc1NSAyLjM5NDQ3Mi04Ljg1NjE2MTIuMDAwMDg3LS4wMDAwMTQzLS4wMDAwMTQtLjAwMDAyOTYtLjAwMDAyOC0uMDAwMDQ0OS0uMDAwMDQ0bC04MC44MTI0MTk0My03OS4xMjIxODVjLTIuNDQ1NTYwMjEtMi4zOTQ0MDgtMi40NDU1NjAyMS02LjI3NjUxMTUgMC04LjY3MDkxOTdsMTcuOTIxNzI5NjMtMTcuNTQ2ODY3M2MyLjQ0NTU2MDItMi4zOTQ0MDgyIDYuNDEwNTk4OS0yLjM5NDQwODIgOC44NTYxNjAyIDBsNTcuMzU0OTc3NSA1Ni4xNTUzNTdjLjYxMTM5MDguNTk4NjAyIDEuNjAyNjQ5LjU5ODYwMiAyLjIxNDAzOTggMCAuMDAwMDA5Mi0uMDAwMDA5LjAwMDAxNzQtLjAwMDAxNy4wMDAwMjY1LS4wMDAwMjRsNTcuMzUyMTAzMS01Ni4xNTUzMzNjMi40NDU1MDUtMi4zOTQ0NjMzIDYuNDEwNTQ0LTIuMzk0NTUzMSA4Ljg1NjE2MS0uMDAwMi4wMDAwMzQuMDAwMDMzNi4wMDAwNjguMDAwMDY3My4wMDAxMDEuMDAwMTAxbDU3LjM1NDkwMiA1Ni4xNTU0MzJjLjYxMTM5LjU5ODYwMSAxLjYwMjY1LjU5ODYwMSAyLjIxNDA0IDBsNTcuMzUzOTc1LTU2LjE1NDMyNDljMi40NDU1NjEtMi4zOTQ0MDkyIDYuNDEwNTk5LTIuMzk0NDA5MiA4Ljg1NjE2IDB6IiBmaWxsPSIjM2I5OWZjIi8+PC9zdmc+';

    private _publicKey: PublicKey | null;
    private _connecting: boolean;
    private _options: WalletConnectWalletAdapterConfig['options'];
    private _wallet: WalletConnectWallet | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' ? WalletReadyState.Unsupported : WalletReadyState.Loadable;
    private _network: WalletAdapterNetwork;

    constructor(config: { network: WalletAdapterNetwork; options: WalletConnectWalletAdapterConfig['options'] }) {
        super();

        this._publicKey = null;
        this._connecting = false;
        this._network = config.network;
        this._options = config.options;
        this._wallet = null;
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
            if (this._readyState !== WalletReadyState.Loadable) throw new WalletNotReadyError();

            this._connecting = true;

            let WalletConnectClass: typeof WalletConnectWallet;
            let WCChainID: typeof WalletConnectChainID;
            try {
                ({ WalletConnectWallet: WalletConnectClass, WalletConnectChainID: WCChainID } = await import(
                    '@jnwng/walletconnect-solana'
                ));
            } catch (error: any) {
                throw new WalletLoadError(error?.message, error);
            }

            let wallet: WalletConnectWallet;
            let client: WalletConnectClient;
            let publicKey: PublicKey;
            try {
                const network = this._network === WalletAdapterNetwork.Mainnet ? WCChainID.Mainnet : WCChainID.Devnet;
                wallet = new WalletConnectClass({ network, options: this._options });

                ({ publicKey } = await wallet.connect());

                if (!publicKey) {
                    throw new WalletPublicKeyError();
                }
            } catch (error: any) {
                if (error.constructor.name === 'QRCodeModalError') {
                    throw new WalletWindowClosedError();
                }
                throw new WalletConnectionError(error?.message, error);
            }

            wallet.client.on('session_delete', this._disconnected);

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
        try {
            await this._wallet?.disconnect();
        } catch (error: any) {
            this.emit('error', new WalletDisconnectionError(error?.message, error));
        }

        this._wallet = null;
        this.emit('disconnect');
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            if (!this._wallet) {
                throw new WalletNotConnectedError();
            }

            try {
                return await this._wallet.signTransaction(transaction);
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
            if (!this._wallet) {
                throw new WalletNotConnectedError();
            }

            try {
                return await this._wallet.signMessage(message);
            } catch (error: any) {
                throw new WalletSignMessageError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    private _disconnected = () => {
        const client = this._wallet?.client;
        if (client) {
            client.off('session_delete', this._disconnected);

            this._publicKey = null;
            this._wallet = null;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };
}
