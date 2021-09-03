import BloctoSDK, { SolanaProviderInterface } from '@blocto/sdk';
import {
    BaseWalletAdapter,
    SendTransactionOptions,
    WalletAccountError,
    WalletAdapterNetwork,
    WalletConnectionError,
    WalletDisconnectionError,
    WalletNotConnectedError,
    WalletNotFoundError,
    WalletPublicKeyError,
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

    get ready(): boolean {
        return true;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._wallet?.connected;
    }

    get autoApprove(): boolean {
        return false;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;
            const sdk = new BloctoSDK({ solana: { net: this._network } });
            const wallet = sdk.solana;
            if (!wallet) throw new WalletNotFoundError();

            if (!wallet.connected) {
                try {
                    await wallet.connect();
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
                }
            }

            if (!wallet.accounts[0]) {
                throw new WalletAccountError('Account not found');
            }

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(wallet.accounts[0]);
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
        if (this._wallet?.connected) {
            this._publicKey = null;

            try {
                this._wallet.disconnect();
            } catch (error: any) {
                this.emit('error', new WalletDisconnectionError(error?.message, error));
            } finally {
                this._wallet = null;
            }

            this.emit('disconnect');
        }
    }

    async sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        try {
            if (!this._wallet?.connected) {
                throw new WalletNotConnectedError();
            }

            transaction.feePayer ||= this.publicKey || undefined;
            transaction.recentBlockhash ||= (await connection.getRecentBlockhash('max')).blockhash;

            const { signers } = options;

            if (signers?.length) {
                transaction = await this._wallet.convertToProgramWalletTransaction(transaction);
                transaction.partialSign(...signers);
            }

            return this._wallet.signAndSendTransaction(transaction, connection);
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
}
