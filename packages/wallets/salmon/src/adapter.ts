import type { WalletName } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletAdapterNetwork,
    WalletConfigError,
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
} from '@solana/wallet-adapter-base';
import type { Transaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import type { default as Salmon, SalmonWallet } from 'salmon-adapter-sdk';

interface SalmonWindow extends Window {
    salmon?: SalmonWallet;
}

declare const window: SalmonWindow;

export interface SalmonWalletAdapterConfig {
    network?: WalletAdapterNetwork;
}

export const SalmonWalletName = 'Salmon' as WalletName<'Salmon'>;

export class SalmonWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = SalmonWalletName;
    url = 'https://www.salmonwallet.io';
    icon =
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgd2lkdGg9IjEwMHB4IiBoZWlnaHQ9IjEwMHB4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOmJ4PSJodHRwczovL2JveHktc3ZnLmNvbSI+CiAgPHBvbHlsaW5lIHN0eWxlPSJmaWxsOiByZ2IoMjE2LCAyMTYsIDIxNik7IHN0cm9rZTogcmdiKDAsIDAsIDApOyIgcG9pbnRzPSIzNC4wMzA5OTgyMjk5ODA0NyA1OC44ODEwMDA1MTg3OTg4MyIvPgogIDxwYXRoIHN0eWxlPSJzdHJva2UtbWl0ZXJsaW1pdDogMTsgc3Ryb2tlOiByZ2IoMjUyLCAxMjksIDk0KTsgZmlsbDogcmdiKDI1MiwgMTI5LCA5NCk7IHBhaW50LW9yZGVyOiBmaWxsOyB2ZWN0b3ItZWZmZWN0OiBub24tc2NhbGluZy1zdHJva2U7IHN0cm9rZS13aWR0aDogMHB4OyIgZD0iTSA5LjgxMSAyOC4zODMgQyA5LjgxMSAyOC4zODMgMzIuOTEgNTguNTI3IDMzLjkzNSA1Ny45MjUgQyAzNC4zODUgNTcuNjYxIDMxLjcgNTMuMyAzMS4yMjYgNTEuMDg4IEMgMzAuODA5IDQ5LjE0NCAzMC40NjQgNDcuMDMyIDMwLjk2OCA0NS40MTIgQyAzMS40MjYgNDMuOTQgMzIuNDg4IDQyLjQzNyAzMy44MDYgNDEuNjcgQyAzNS4yNzcgNDAuODEzIDM3LjUyNiA0MC43NzUgMzkuNjExIDQwLjg5NiBDIDQyLjEwNiA0MS4wNDEgNDUuMjg0IDQxLjk4OSA0Ny43MzkgNDIuOTYxIEMgNDkuOTcgNDMuODQ1IDUzLjI4OCA0Ni44MyA1My44MDIgNDYuMzE1IEMgNTQuNDg2IDQ1LjYzMSA1MC41MTEgMzguNjU5IDQ3Ljg2OCAzNS42MDcgQyA0NS4xNjYgMzIuNDg2IDQxLjMzNyAyOS42MzUgMzcuNjc2IDI3Ljg2NyBDIDM0LjIxMyAyNi4xOTQgMzAuMDU2IDI1LjI4MSAyNi41ODEgMjUuMDI5IEMgMjMuNTc2IDI0LjgxMSAyMC44NTggMjUuMzc1IDE4LjA2NyAyNS45MzIgQyAxNS4yNjggMjYuNDkxIDkuODExIDI4LjM4MyA5LjgxMSAyOC4zODMgQyA5LjgxMSAyOC4zODMgOS44MTEgMjguMzgzIDkuODExIDI4LjM4MyBDIDkuODExIDI4LjM4MyA5LjgxMSAyOC4zODMgOS44MTEgMjguMzgzIiBieDpkPSJNIDkuODExIDI4LjM4MyBSIDMzLjkzNSA1Ny45MjUgUiAzMS4yMjYgNTEuMDg4IFIgMzAuOTY4IDQ1LjQxMiBSIDMzLjgwNiA0MS42NyBSIDM5LjYxMSA0MC44OTYgUiA0Ny43MzkgNDIuOTYxIFIgNTMuODAyIDQ2LjMxNSBSIDQ3Ljg2OCAzNS42MDcgUiAzNy42NzYgMjcuODY3IFIgMjYuNTgxIDI1LjAyOSBSIDE4LjA2NyAyNS45MzIgUiA5LjgxMSAyOC4zODMgUiA5LjgxMSAyOC4zODMgWiAxQDA5MzRmMDJiIi8+CiAgPHBhdGggc3R5bGU9InN0cm9rZTogcmdiKDIzOSwgMTA2LCA5NSk7IGZpbGw6IHJnYigyMzksIDEwNiwgOTUpOyIgZD0iTSA1Ny4xNTYgNTMuNDEgQyA1Ny4xNTYgNTMuNDEgNTkuNTc4IDU2LjU1OCA2MC43NjggNTguMDU0IEMgNjEuODk5IDU5LjQ3NyA2Mi44MjYgNjAuNzgxIDY0LjEyMiA2Mi4xODMgQyA2NS42NDEgNjMuODI1IDY3LjUxMSA2NS44OCA2OS40MTIgNjcuMjE0IEMgNzEuMTg0IDY4LjQ1OCA3My4yOTQgNjkuNDI1IDc1LjA4OCA3MC4wNTIgQyA3Ni41NzQgNzAuNTcyIDc3Ljg4MSA3MC45IDc5LjM0NSA3MC45NTUgQyA4MC44ODYgNzEuMDEzIDg0LjA3MiA3MC4xMjUgODQuMTE4IDcwLjMxIEMgODQuMTc1IDcwLjU0MiA3OS40NTcgNzIuMTI1IDc3LjAyMyA3Mi44OSBDIDc0LjUxNiA3My42NzggNzEuODc1IDc0LjYxNCA2OS4yODMgNzQuOTU0IEMgNjYuNzU3IDc1LjI4NSA2NC4zMzIgNzUuMjczIDYxLjY3MSA3NC45NTQgQyA1OC42NDggNzQuNTkyIDU1LjAwMyA3My44MjIgNTIuMTI1IDcyLjYzMiBDIDQ5LjQ1NSA3MS41MjggNDcuMTIyIDcwLjAyNiA0NC45IDY4LjI0NiBDIDQyLjU5MiA2Ni4zOTYgNDAuMyA2NC4wNTEgMzguNTc5IDYxLjY2NiBDIDM2LjkzNyA1OS4zOSAzNS41NyA1Ni43OTcgMzQuNzA5IDU0LjMxMyBDIDMzLjkxNCA1Mi4wMTkgMzIuOTQgNDkuMjA2IDMzLjQxOSA0Ny4zNDcgQyAzMy44MDggNDUuODM3IDM1LjExNyA0NC40MjMgMzYuMzg2IDQzLjczNSBDIDM3LjY1NCA0My4wNDcgMzkuNDY2IDQzLjA3MiA0MS4wMyA0My4yMTkgQyA0Mi42OSA0My4zNzUgNDQuMzcgNDQuMTQ2IDQ2LjA2MSA0NC43NjcgQyA0Ny44NTEgNDUuNDI0IDUwLjAwMSA0Ni4yNDkgNTEuNDggNDcuMDg5IEMgNTIuNjIxIDQ3LjczNyA1My40NDYgNDguMjQ0IDU0LjMxOCA0OS4xNTMgQyA1NS4zNzEgNTAuMjUgNTcuMTU2IDUzLjQxIDU3LjE1NiA1My40MSBDIDU3LjE1NiA1My40MSA1Ny4xNTYgNTMuNDEgNTcuMTU2IDUzLjQxIiBieDpkPSJNIDU3LjE1NiA1My40MSBSIDYwLjc2OCA1OC4wNTQgUiA2NC4xMjIgNjIuMTgzIFIgNjkuNDEyIDY3LjIxNCBSIDc1LjA4OCA3MC4wNTIgUiA3OS4zNDUgNzAuOTU1IFIgODQuMTE4IDcwLjMxIFIgNzcuMDIzIDcyLjg5IFIgNjkuMjgzIDc0Ljk1NCBSIDYxLjY3MSA3NC45NTQgUiA1Mi4xMjUgNzIuNjMyIFIgNDQuOSA2OC4yNDYgUiAzOC41NzkgNjEuNjY2IFIgMzQuNzA5IDU0LjMxMyBSIDMzLjQxOSA0Ny4zNDcgUiAzNi4zODYgNDMuNzM1IFIgNDEuMDMgNDMuMjE5IFIgNDYuMDYxIDQ0Ljc2NyBSIDUxLjQ4IDQ3LjA4OSBSIDU0LjMxOCA0OS4xNTMgUiA1Ny4xNTYgNTMuNDEgWiAxQDlkOTVhNzVkIi8+CiAgPHBhdGggc3R5bGU9ImZpbGw6IHJnYigyMjgsIDg3LCA5NSk7IHN0cm9rZTogcmdiKDIyOCwgODcsIDk1KTsiIGQ9Ik0gNzUuMDg4IDUxLjg2MiBDIDc1LjA4OCA1MS44NjIgNzguMjk2IDU4LjE3OCA3OS43MzIgNTkuNjAyIEMgODAuNDk1IDYwLjM1OCA4MS4xNjQgNjAuODU4IDgxLjkyNSA2MC44OTIgQyA4Mi43MSA2MC45MjcgODMuMzgyIDYwLjQxNCA4NC4zNzYgNTkuNzMxIEMgODYuNDQ3IDU4LjMwOCA5Mi4wNTkgNTEuMTEgOTIuODkxIDUxLjYwNCBDIDkzLjU5NSA1Mi4wMjIgOTEuNTU0IDU3LjMwOSA5MC42OTggNTkuNzMxIEMgODkuOTcxIDYxLjc4NyA4OS4zMTQgNjMuODI0IDg4LjI0NyA2NS4yNzkgQyA4Ny4zNDkgNjYuNTA0IDg2LjQyMiA2Ny40OTggODUuMDIxIDY4LjExNyBDIDgzLjIzMSA2OC45MDggNzkuOTE1IDY5LjExIDc4LjA1NSA2OC44OTEgQyA3Ni43NTQgNjguNzM4IDc1LjYwNiA2OC4xOTEgNzQuODMgNjcuNzMgQyA3NC4zMDggNjcuNDIgNzMuNzMgNjcuMTUzIDczLjY2OSA2Ni42OTggQyA3My41ODMgNjYuMDU4IDc1LjAxNiA2NS4xODIgNzUuMzQ2IDY0LjExOCBDIDc1Ljc3MyA2Mi43NCA3NS41MDIgNjAuODEzIDc1LjQ3NSA1OC45NTcgQyA3NS40NDMgNTYuNzc5IDc1LjA4OCA1MS44NjIgNzUuMDg4IDUxLjg2MiBDIDc1LjA4OCA1MS44NjIgNzUuMDg4IDUxLjg2MiA3NS4wODggNTEuODYyIEMgNzUuMDg4IDUxLjg2MiA3NS4wODggNTEuODYyIDc1LjA4OCA1MS44NjIiIGJ4OmQ9Ik0gNzUuMDg4IDUxLjg2MiBSIDc5LjczMiA1OS42MDIgUiA4MS45MjUgNjAuODkyIFIgODQuMzc2IDU5LjczMSBSIDkyLjg5MSA1MS42MDQgUiA5MC42OTggNTkuNzMxIFIgODguMjQ3IDY1LjI3OSBSIDg1LjAyMSA2OC4xMTcgUiA3OC4wNTUgNjguODkxIFIgNzQuODMgNjcuNzMgUiA3My42NjkgNjYuNjk4IFIgNzUuMzQ2IDY0LjExOCBSIDc1LjQ3NSA1OC45NTcgUiA3NS4wODggNTEuODYyIFIgNzUuMDg4IDUxLjg2MiBaIDFAOGRmYWI0NGQiLz4KPC9zdmc+';

    private _connecting: boolean;
    private _wallet: Salmon | null;
    private _publicKey: PublicKey | null;
    private _network: WalletAdapterNetwork;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.Loadable;

    constructor({ network = WalletAdapterNetwork.Mainnet }: SalmonWalletAdapterConfig = {}) {
        super();
        this._network = network;
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (typeof window.salmon?.postMessage === 'function') {
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
        return !!this._wallet?.connected;
    }

    get readyState() {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Loadable && this._readyState !== WalletReadyState.Installed)
                throw new WalletNotReadyError();

            this._connecting = true;

            let SalmonClass: typeof Salmon;
            try {
                ({ default: SalmonClass } = await import('salmon-adapter-sdk'));
            } catch (error: any) {
                throw new WalletLoadError(error?.message, error);
            }

            let wallet: Salmon;
            try {
                wallet = new SalmonClass({ network: this._network });
            } catch (error: any) {
                throw new WalletConfigError(error?.message, error);
            }

            if (!wallet.connected) {
                try {
                    await wallet.connect();
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
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
                return await wallet.signMessage(message, 'utf8');
            } catch (error: any) {
                throw new WalletSignMessageError(error?.message, error);
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
