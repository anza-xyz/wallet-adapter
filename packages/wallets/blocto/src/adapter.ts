import type { SolanaProviderInterface } from '@blocto/sdk';
import {
    BaseWalletAdapter,
    SendTransactionOptions,
    WalletAccountError,
    WalletAdapterNetwork,
    WalletConfigError,
    WalletConnectionError,
    WalletDisconnectionError,
    WalletLoadError,
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

export class BloctoWalletAdapter extends BaseWalletAdapter {
    private _connecting: boolean;
    private _wallet: SolanaProviderInterface | null;
    private _publicKey: PublicKey | null;
    private _network: string;
    private _readyState: WalletReadyState =
        typeof window !== 'undefined' ? WalletReadyState.Unsupported : WalletReadyState.Loadable;

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

            let BloctoSDK: typeof import('@blocto/sdk');
            try {
                BloctoSDK = await import('@blocto/sdk');
            } catch (error: any) {
                throw new WalletLoadError(error?.message, error);
            }

            let wallet: SolanaProviderInterface | undefined;
            try {
                wallet = new BloctoSDK.default({ solana: { net: this._network } }).solana;
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

            this.emit('connect');
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
                transaction.feePayer ||= this.publicKey || undefined;
                transaction.recentBlockhash ||= (await connection.getRecentBlockhash('finalized')).blockhash;

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
