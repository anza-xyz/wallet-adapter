import { ParticleNetwork, Config } from '@particle-network/provider';
import {
    BaseMessageSignerWalletAdapter,
    WalletAccountError,
    WalletConfigError,
    WalletConnectionError,
    WalletDisconnectionError,
    WalletName,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { Buffer } from 'buffer';

interface ParticleWindow extends Window {
    particle?: ParticleNetwork;
}

declare const window: ParticleWindow;

export interface ParticleNetworkAdapterConfig extends Config {}

export const ParticleNetworkName = 'Particle Network' as WalletName<'Particle Network'>;

export class ParticleNetworkAdapter extends BaseMessageSignerWalletAdapter {
    name = ParticleNetworkName;
    url = 'https://particle.network';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NSIgaGVpZ2h0PSI2Mi41MDgiIHZpZXdCb3g9IjAgMCA1NSA2Mi41MDgiPgogIDxkZWZzPgogICAgPHN0eWxlPgogICAgICAuY2xzLTEgewogICAgICAgIGZpbGw6ICMwMDdhZmY7CiAgICAgIH0KICAgIDwvc3R5bGU+CiAgPC9kZWZzPgogIDxwYXRoIGlkPSLmpK3lnIZfM1/mi7fotJ0iIGRhdGEtbmFtZT0i5qSt5ZyGIDMg5ou36LSdIiBjbGFzcz0iY2xzLTEiIGQ9Ik0yNS4zMSw2MS43NDNhNCw0LDAsMSwxLDIuMzQ5Ljc2NkE0LjAxMSw0LjAxMSwwLDAsMSwyNS4zMSw2MS43NDNabS05LjQ4Ni0xLjAyYTQsNCwwLDEsMSwzLjI0MiwxLjY1MkE0LjAxMSw0LjAxMSwwLDAsMSwxNS44MjUsNjAuNzIzWm0xOC44MjEtLjk0NWE0LDQsMCwxLDEsMS4yMzguMkE0LjAwNyw0LjAwNywwLDAsMSwzNC42NDUsNTkuNzc4Wk03LjExOSw1Ni44MThhNCw0LDAsMSwxLDMuODA3LDIuNzdBNC4wMSw0LjAxLDAsMCwxLDcuMTE5LDU2LjgxOFptMzEuODA1LTUuODA2YTQsNCwwLDEsMSw0LDQuMDA2QTQsNCwwLDAsMSwzOC45MjQsNTEuMDEyWk0wLDUwLjQxYTQsNCwwLDAsMSw0LjA0Ni0zLjk1OSwzLjk2LDMuOTYsMCwxLDEsMCw3LjkxOEE0LDQsMCwwLDEsMCw1MC40MVptMTkuMjE0LS45NDdhMi40LDIuNCwwLDEsMSwxLjk0NC45OTFBMi40MDYsMi40MDYsMCwwLDEsMTkuMjE0LDQ5LjQ2M1ptNS45NDcuNTE1YTIuNCwyLjQsMCwxLDEsMS40MS40NTlBMi40MDYsMi40MDYsMCwwLDEsMjUuMTYxLDQ5Ljk3N1pNMTMuNzE3LDQ3LjEzMkEyLjQsMi40LDAsMSwxLDE2LDQ4Ljc5NCwyLjQwNiwyLjQwNiwwLDAsMSwxMy43MTcsNDcuMTMyWm0xNy4yNTksMS41YTIuNCwyLjQsMCwxLDEsLjc0My4xMThBMi40LDIuNCwwLDAsMSwzMC45NzYsNDguNjI3Wm0xMy4zLTMuMjYxYTMuOTk1LDMuOTk1LDAsMSwxLDMuOCwyLjc3QTQuMDA3LDQuMDA3LDAsMCwxLDQ0LjI3NCw0NS4zNjZaTTkuMTc5LDQzLjIxYTIuNDMzLDIuNDMzLDAsMSwxLDIuNDMyLDIuMzczQTIuNCwyLjQsMCwwLDEsOS4xNzksNDMuMjFaTTMzLjcsNDMuMTQxYTIuNCwyLjQsMCwxLDEsMi40LDIuNDA4QTIuNCwyLjQsMCwwLDEsMzMuNyw0My4xNDFabS0xMy4zNzUtMi4yYTEuMjgsMS4yOCwwLDEsMSwxLjAzNy41MjhBMS4yODQsMS4yODQsMCwwLDEsMjAuMzIzLDQwLjkzOVptMy4yNDYuMjU5YTEuMjc5LDEuMjc5LDAsMSwxLC43NTIuMjQ1QTEuMjgyLDEuMjgyLDAsMCwxLDIzLjU3LDQxLjJabTEzLjQwNS0xLjcxMmEyLjQsMi40LDAsMSwxLDIuMjgzLDEuNjYyQTIuNCwyLjQsMCwwLDEsMzYuOTc1LDM5LjQ4NlptLTE5LjY1OS4yYTEuMjc5LDEuMjc5LDAsMSwxLDEuMjE4Ljg4NkExLjI4NCwxLjI4NCwwLDAsMSwxNy4zMTYsMzkuNjg2Wm05LjQyMS43NTVhMS4yNzksMS4yNzksMCwxLDEsLjQuMDYzQTEuMjgzLDEuMjgzLDAsMCwxLDI2LjczNyw0MC40NDJabTIwLjg4OS0yLjEwNmE0LDQsMCwxLDEsMy4yNDEsMS42NTJBNC4wMTEsNC4wMTEsMCwwLDEsNDcuNjI3LDM4LjMzNlptLTMyLjgtLjc3NWExLjMsMS4zLDAsMSwxLDEuMywxLjI3M0ExLjI4NiwxLjI4NiwwLDAsMSwxNC44MjYsMzcuNTYxWm0xMy40LS4xYTEuMjg2LDEuMjg2LDAsMSwxLDEuMjg2LDEuMjg1QTEuMjg1LDEuMjg1LDAsMCwxLDI4LjIyNiwzNy40NTdabTEuNzk0LTIuMDE1YTEuMjgsMS4yOCwwLDEsMSwxLjIxOC44ODZBMS4yODIsMS4yODIsMCwwLDEsMzAuMDIsMzUuNDQyWm04Ljk1My0uNDQ3YTIuNCwyLjQsMCwxLDEsMS45NDUuOTkxQTIuNDA2LDIuNDA2LDAsMCwxLDM4Ljk3MywzNC45OTVaTTMxLjEsMzIuOTcxYTEuMjc5LDEuMjc5LDAsMSwxLDEuMDM3LjUyOUExLjI4NCwxLjI4NCwwLDAsMSwzMS4xLDMyLjk3MVptMTcuNTQ5LTIuMzU4YTQsNCwwLDEsMSwyLjM0OS43NjVBNC4wMTEsNC4wMTEsMCwwLDEsNDguNjQ1LDMwLjYxM1pNMzkuNDg4LDMwLjFhMi40LDIuNCwwLDEsMSwxLjQxLjQ1OUEyLjQwOCwyLjQwOCwwLDAsMSwzOS40ODgsMzAuMVptLTguMTMyLjE4M2ExLjI4LDEuMjgsMCwxLDEsLjc1MS4yNDVBMS4yODQsMS4yODQsMCwwLDEsMzEuMzU2LDMwLjI4OFptLS41ODEtMi42MzJhMS4yNzgsMS4yNzgsMCwxLDEsLjQuMDYzQTEuMjgzLDEuMjgzLDAsMCwxLDMwLjc3NSwyNy42NTZabS0xNi4wNDMtMy41YTEuMjg2LDEuMjg2LDAsMSwxLDEuMjg3LDEuMjg2QTEuMjg2LDEuMjg2LDAsMCwxLDE0LjczMiwyNC4xNTZabTIzLjczNiwxLjEzOWEyLjQsMi40LDAsMSwxLC43NDMuMTE4QTIuNCwyLjQsMCwwLDEsMzguNDY4LDI1LjI5NVpNMjguMTA5LDI0LjA1MmExLjMsMS4zLDAsMSwxLDEuMywxLjI3NEExLjI4NSwxLjI4NSwwLDAsMSwyOC4xMDksMjQuMDUyWk0xOCwyMy42MTRhMS4yNzksMS4yNzksMCwxLDEsLjQuMDYzQTEuMjgzLDEuMjgzLDAsMCwxLDE4LDIzLjYxNFptNy43NzctLjg5MkExLjI4LDEuMjgsMCwxLDEsMjcsMjMuNjA4LDEuMjgyLDEuMjgyLDAsMCwxLDI1Ljc4MSwyMi43MjJabTIxLjQ0OS4yM2E0LDQsMCwxLDEsMS4yMzcuMkE0LjAwOSw0LjAwOSwwLDAsMSw0Ny4yMywyMi45NTNabS0yNi43NzItLjQ2YTEuMjc5LDEuMjc5LDAsMSwxLC43NTIuMjQ1QTEuMjgzLDEuMjgzLDAsMCwxLDIwLjQ1OCwyMi40OTJabTIuNjc5LS4zMDdhMS4yOCwxLjI4LDAsMSwxLDEuMDM4LjUyOUExLjI4MywxLjI4MywwLDAsMSwyMy4xMzcsMjIuMTg1Wk05LjEzMiwxOC43YTIuNCwyLjQsMCwxLDEsMi40LDIuNDA4QTIuNCwyLjQsMCwwLDEsOS4xMzIsMTguN1ptMjQuNDQ5LS4wN2EyLjQzMywyLjQzMywwLDEsMSwyLjQzMiwyLjM3M0EyLjQsMi40LDAsMCwxLDMzLjU4MSwxOC42MzRabS0xOC40MTgtLjg0MWEyLjQsMi40LDAsMSwxLC43NDIuMTE4QTIuNCwyLjQsMCwwLDEsMTUuMTY0LDE3Ljc5M1pNMjkuMzM4LDE2LjJhMi40LDIuNCwwLDEsMSwyLjI4NCwxLjY2MkEyLjQwNiwyLjQwNiwwLDAsMSwyOS4zMzgsMTYuMlptLTkuNy0uNDQxYTIuNCwyLjQsMCwxLDEsMS40MS40NTlBMi40MDcsMi40MDcsMCwwLDEsMTkuNjM5LDE1Ljc2Wm00Ljg4NS0uNTQ4YTIuNCwyLjQsMCwxLDEsMS45NDQuOTkxQTIuNDA2LDIuNDA2LDAsMCwxLDI0LjUyNCwxNS4yMTJabTE0Ljk1LTMuMTE3YTQuMDQ2LDQuMDQ2LDAsMSwxLDQuMDQ1LDMuOTU5QTQsNCwwLDAsMSwzOS40NzQsMTIuMDk1Wm0tMzguODE5LS42YTQsNCwwLDEsMSw0LDRBNCw0LDAsMCwxLC42NTYsMTEuNDkzWm0zMi4xOC0zLjMyNWE0LDQsMCwxLDEsMy44MDUsMi43N0E0LjAwOCw0LjAwOCwwLDAsMSwzMi44MzUsOC4xNjdaTTEwLjQ0OCwxMC4zNTJhNCw0LDAsMSwxLDEuMjM4LjJBNC4wMDcsNC4wMDcsMCwwLDEsMTAuNDQ4LDEwLjM1MlpNMjUuMjY2LDYuNWE0LDQsMCwxLDEsMy4yNDIsMS42NTJBNC4wMSw0LjAxLDAsMCwxLDI1LjI2Niw2LjVabS03LjcxMy43NTNhNCw0LDAsMSwxLDIuMzQ5Ljc2NkE0LjAxMSw0LjAxMSwwLDAsMSwxNy41NTMsNy4yNDlaIi8+Cjwvc3ZnPgo=';

    private _connecting: boolean;
    private _wallet: ParticleNetwork | null;
    private _publicKey: PublicKey | null;
    private _config: ParticleNetworkAdapterConfig;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' ? WalletReadyState.Unsupported : WalletReadyState.Loadable;

    constructor(config: ParticleNetworkAdapterConfig) {
        super();
        this._connecting = false;
        this._publicKey = null;
        this._wallet = null;
        this._config = config;
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._wallet?.auth.isLogin();
    }

    get readyState(): WalletReadyState {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Loadable) throw new WalletNotReadyError();

            this._connecting = true;

            let wallet: ParticleNetwork;
            try {
                wallet = window.particle || new ParticleNetwork(this._config);
            } catch (error: any) {
                throw new WalletConfigError(error?.message, error);
            }

            let userInfo;
            try {
                userInfo = await wallet.getSolanaProvider().connect();
            } catch (error: any) {
                throw new WalletConnectionError(error?.message, error);
            }

            if (!userInfo.publicKey) {
                throw new WalletAccountError();
            }

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(userInfo.publicKey);
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
                if (wallet.auth.isLogin()) await wallet.getSolanaProvider().disconnect();
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
                const tx = await wallet.getSolanaProvider().signTransaction(bs58.encode(transaction.serialize()));
                return Transaction.from(Buffer.from(tx, 'base64'));
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
                const signatures = await wallet
                    .getSolanaProvider()
                    .signAllTransactions(transactions.map((tx) => bs58.encode(tx.serialize())));
                return signatures.map((signature) => Transaction.from(Buffer.from(signature, 'base64')));
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
                const signature = await wallet.getSolanaProvider().signMessage(bs58.encode(message));
                return Buffer.from(signature, 'base64');
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
}
