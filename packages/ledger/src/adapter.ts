import Transport from '@ledgerhq/hw-transport';
import TransportWebHid from '@ledgerhq/hw-transport-webhid';
import {
    EventEmitter,
    WalletAdapter,
    WalletAdapterEvents,
    WalletConnectionError,
    WalletNotConnectedError,
    WalletPublicKeyError,
    WalletSignatureError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getDerivationPath, getPublicKey, signTransaction } from './util';

export interface LedgerWalletAdapterConfig {
    derivationPath?: Buffer;
}

export class LedgerWalletAdapter extends EventEmitter<WalletAdapterEvents> implements WalletAdapter {
    private _publicKey: PublicKey | null;
    private _provider: Transport | undefined;
    private _connecting: boolean;
    private _derivationPath: Buffer;

    constructor(config: LedgerWalletAdapterConfig = {}) {
        super();
        this._publicKey = null;
        this._connecting = false;
        this._derivationPath = config.derivationPath || getDerivationPath(0, 0);
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get ready(): boolean {
        // @FIXME: could return !!navigator.hid
        return true;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._provider;
    }

    get autoApprove(): boolean {
        return false;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            let provider: Transport;
            try {
                provider = await TransportWebHid.create();
            } catch (error) {
                throw new WalletConnectionError(error?.message, error);
            }

            let publicKey: PublicKey;
            try {
                publicKey = await getPublicKey(provider, this._derivationPath);
            } catch (error) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            const disconnect = () => {
                provider.off('disconnect', disconnect);
                this.disconnect();
            };
            provider.on('disconnect', disconnect);

            this._publicKey = publicKey;
            this._provider = provider;
            this.emit('connect');
        } catch (error) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        const provider = this._provider;
        if (provider) {
            this._publicKey = null;
            this._provider = undefined;

            try {
                await provider.close();
            } catch (error) {
                this.emit('error', error);
            }

            this.emit('disconnect');
        }
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            const provider = this._provider;
            const publicKey = this._publicKey;
            if (!provider || !publicKey) throw new WalletNotConnectedError();

            try {
                const signature = await signTransaction(provider, transaction, this._derivationPath);
                transaction.addSignature(publicKey, signature);
            } catch (error) {
                throw new WalletSignatureError(error?.message, error);
            }

            return transaction;
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        try {
            const provider = this._provider;
            const publicKey = this._publicKey;
            if (!provider || !publicKey) throw new WalletNotConnectedError();

            const derivationPath = this._derivationPath;
            try {
                for (const transaction of transactions) {
                    const signature = await signTransaction(provider, transaction, derivationPath);
                    transaction.addSignature(publicKey, signature);
                }
            } catch (error) {
                throw new WalletSignatureError(error?.message, error);
            }

            return transactions;
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
}
