import type { default as Blocto, SolanaProviderInterface } from '@blocto/sdk';
import {
    BaseWalletAdapter,
    SendTransactionOptions,
    WalletAccountError,
    WalletAdapterNetwork,
    WalletConfigError,
    WalletConnectionError,
    WalletDisconnectionError,
    WalletLoadError,
    WalletName,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSendTransactionError,
} from '@solana/wallet-adapter-base';
import { Connection, PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';

export interface BloctoWalletAdapterConfig {
    network?: WalletAdapterNetwork;
}

export const BloctoWalletName = 'Blocto' as WalletName;

export class BloctoWalletAdapter extends BaseWalletAdapter {
    name = BloctoWalletName;
    url = 'https://blocto.app';
    icon =
        'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZD0ibTE5LjQ4MzggMTUuMjQ5Yy4yNzY5IDAgLjUwNDguMjA5OS41MzI1LjQ3ODhsLjAwMjIuMDQyOS0uMDA0My4xMTQyYy0uMzM1IDMuOTgzMy0zLjc5MDQgNy4xMTUxLTguMDAzNyA3LjExNTEtNC4xNzA2IDAtNy41OTg2My0zLjA2ODctNy45OTI2OS02Ljk5NDZsLS4wMTYzOC0uMTgxMS0uMDAxMDYtLjA1MzIuMDAxNzgtLjAzOThjLjAyNTk4LS4yNzA2LjI1NDg3LS40ODIzLjUzMjg5LS40ODIzeiIgZmlsbD0iI2FmZDhmNyIvPjxwYXRoIGQ9Im00LjMwMDA5IDFjMy43ODc1NSAwIDYuODI1ODEgMi45MDkxMSA2LjgyNTgxIDYuNTAyNzd2Ni4zNTM0M2MtLjAwMDQuMjkxNy0uMjM5Mi41Mjg0LS41MzQuNTI4OGwtNi4wNTc1OC4wMDMyYy0uMjk1MTEuMDAwNy0uNTM0MzItLjIzNjEtLjUzNDMyLS41Mjc4bC4wMDAzNi0xMi41NjM3NWMwLS4xNTE0OS4xMTQyNi0uMjc2MjIuMjYxOTktLjI5NDE4eiIgZmlsbD0iIzE4MmE3MSIvPjxwYXRoIGQ9Im0xOS42OTIxIDEyLjIzODMuMDM4OC4xMjgzLS4wMjg4LS4wODQ2Yy4xNjE2LjQ1MzQuMjY2Ni43NzY5LjMxNTMgMS4zNDEzLjAzMzUuMzg3OS0uMjU3LjcyODktLjY0ODUuNzYybC0uMDMwMy4wMDIyLTMuMDgwOS4wMDA3Yy0yLjEwNjMgMC0zLjgyMDQtMS40NzQxLTMuODc1Mi0zLjU0MjNsLS4wMDE0LS4xMDIxdi0zLjQ2NThjMC0uMjAxNTMuMTY5NC0uMzY5NTkuMzc0MS0uMzYwMDcgMy4zMDAzLjE1NDY2IDUuOTk3OCAyLjM0MTUxIDYuOTM2OSA1LjMyMDM3eiIgZmlsbD0iIzM0ODVjNCIvPjwvZz48L3N2Zz4=';

    private _connecting: boolean;
    private _wallet: SolanaProviderInterface | null;
    private _publicKey: PublicKey | null;
    private _network: string;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' ? WalletReadyState.Unsupported : WalletReadyState.Loadable;

    constructor(config: BloctoWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
        this._network = config.network || WalletAdapterNetwork.Mainnet;
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

            let BloctoClass: typeof Blocto;
            try {
                ({ default: BloctoClass } = await import('@blocto/sdk'));
            } catch (error: any) {
                throw new WalletLoadError(error?.message, error);
            }

            let wallet: SolanaProviderInterface | undefined;
            try {
                wallet = new BloctoClass({ solana: { net: this._network } }).solana;
            } catch (error: any) {
                throw new WalletConfigError(error?.message, error);
            }

            if (!wallet) throw new WalletConfigError();

            if (!wallet.connected) {
                try {
                    await wallet.connect();
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
                }
            }

            const account = wallet.accounts[0];
            if (!account) throw new WalletAccountError();

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

    async sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                transaction.feePayer = transaction.feePayer || this.publicKey || undefined;
                transaction.recentBlockhash =
                    transaction.recentBlockhash || (await connection.getRecentBlockhash('finalized')).blockhash;

                const { signers } = options;
                if (signers?.length) {
                    transaction = await wallet.convertToProgramWalletTransaction(transaction);
                    transaction.partialSign(...signers);
                }

                return await wallet.signAndSendTransaction(transaction, connection);
            } catch (error: any) {
                throw new WalletSendTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
}
