import {
    BaseSignerWalletAdapter,
    pollUntilReady,
    WalletAccountError,
    WalletNotConnectedError,
    WalletNotFoundError,
    WalletNotInstalledError,
    WalletPublicKeyError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';

interface Coin98Wallet {
    isCoin98?: boolean;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    isConnected(): boolean;
    connect(): Promise<string[]>;
    disconnect(): Promise<void>;
    request(params: { method: string; params: string | string[] | unknown }): Promise<{
        signature: string;
        publicKey: string;
    }>;
}

interface Coin98Window extends Window {
    coin98?: {
        sol?: Coin98Wallet;
    };
}

declare const window: Coin98Window;

export interface Coin98WalletAdapterConfig {
    pollInterval?: number;
    pollCount?: number;
}

export class Coin98WalletAdapter extends BaseSignerWalletAdapter {
    private _connecting: boolean;
    private _wallet: Coin98Wallet | null;
    private _publicKey: PublicKey | null;
    private _canPollForChange: boolean;
    private _pollInterval: number;

    constructor(config: Coin98WalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
        this._canPollForChange = false;
        this._pollInterval = config.pollInterval ? config.pollInterval : 1000;

        if (!this.ready) pollUntilReady(this, this._pollInterval, config.pollCount || 3);
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get ready(): boolean {
        return typeof window !== 'undefined' && !!window.coin98;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._wallet?.isConnected();
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            const wallet = typeof window !== 'undefined' && window.coin98?.sol;
            if (!wallet) throw new WalletNotFoundError();
            if (!wallet.isCoin98) throw new WalletNotInstalledError();

            const publicKey = await this._getConnectedPublicKey(wallet);

            this._wallet = wallet;
            this._publicKey = publicKey;
            this._canPollForChange = true;
            this._pollUntilBreak(this._changeCallback, this._pollInterval);

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

            await wallet.disconnect();
        }

        this.emit('disconnect');
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const response = await wallet.request({ method: 'sol_sign', params: [transaction] });

                const publicKey = new PublicKey(response.publicKey);
                const signature = bs58.decode(response.signature);

                transaction.addSignature(publicKey, signature);
                return transaction;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        const signedTransactions: Transaction[] = [];
        for (const transaction of transactions) {
            signedTransactions.push(await this.signTransaction(transaction));
        }
        return signedTransactions;
    }

    private _pollUntilBreak(callback: (adapter: Coin98WalletAdapter) => Promise<boolean>, interval: number): void {
        setTimeout(async () => {
            const done = await callback(this);
            if (!done) this._pollUntilBreak(callback, interval);
        }, interval, this);
    }

    private async _getConnectedPublicKey(wallet: Coin98Wallet): Promise<PublicKey> {
        let account: string;
        try {
            [account] = await wallet.connect();
        } catch (error: any) {
            throw new WalletAccountError(error?.message, error);
        }

        let publicKey: PublicKey;
        try {
            publicKey = new PublicKey(account);
        } catch (error: any) {
            throw new WalletPublicKeyError(error?.message, error);
        }
        return publicKey;
    }

    private async _changeCallback(adapter: Coin98WalletAdapter): Promise<boolean> {
        if (!adapter._canPollForChange) return true;
        await adapter._change();
        return false;
    }

    private async _change(): Promise<void> {
        const wallet = this._wallet;

        if (wallet) {
            const publicKey = await this._getConnectedPublicKey(wallet);

            if (this._publicKey?.toBase58() !== publicKey.toBase58()) {
                this._wallet = wallet;
                this._publicKey = publicKey;
                this.emit('change');
            }
        }
    }
}
