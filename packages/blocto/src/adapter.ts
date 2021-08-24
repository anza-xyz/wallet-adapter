import {
    BaseSignerWalletAdapter,
    EventEmitter,
    WalletAccountError,
    WalletConnectionError,
    WalletError,
    WalletNotFoundError,
    WalletNotInstalledError,
    WalletPublicKeyError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import BloctoSDK from '@blocto/sdk';
import { PublicKey, Transaction } from '@solana/web3.js';

interface BloctoWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface BloctoWallet extends EventEmitter<BloctoWalletEvents> {
    isBlocto?: boolean;
    accounts: Array<string>;
    connected: boolean;
    signAndSendTransaction(transaction: Transaction): Promise<string>;
    convertToProgramWalletTransaction(transaction: Transaction): Promise<Transaction>;
    connect(): Promise<void>;
}

export interface BloctoWalletAdapterConfig {
    pollInterval?: number;
    pollCount?: number;
    net?: string;
}

export class BloctoWalletAdapter extends BaseSignerWalletAdapter {
    private _connecting: boolean;
    private _wallet: BloctoWallet | null;
    private _publicKey: PublicKey | null;
    private net: string | null;

    constructor(config: BloctoWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
        this.net = config.net || null;
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
            const sdk = new BloctoSDK({ solana: { net: this.net } });
            const wallet = sdk.solana;
            if (!wallet) throw new WalletNotFoundError();
            if (!wallet.isBlocto) throw new WalletNotInstalledError();

            if (!wallet.connected) {
                try {
                    await new Promise<void>((resolve, reject) => {
                        wallet.connect()
                            .then(() => resolve())
                            .catch((reason: any) => reject(reason));
                    });
                } catch (error) {
                    if (error instanceof WalletError) throw error;
                    throw new WalletConnectionError(error?.message, error);
                }
            }

            if (!wallet.accounts || !wallet.accounts[0]) {
                throw new WalletAccountError("Account not found");
            }

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(wallet.accounts[0]);
            } catch (error) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            this._wallet = wallet;
            this._publicKey = publicKey;

            this.emit('connect');
        } catch (error) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        return;
    }

    async signTransaction(): Promise<Transaction> {
        throw new WalletSignTransactionError(
            'Blocto is a contract wallet and doesn\'t support "signTransaction", please use "sendTransaction" instead.'
        );
    }

    async signAllTransactions(): Promise<Transaction[]> {
        throw new WalletSignTransactionError(
            'Blocto is a contract wallet and doesn\'t support "signAllTransactions", please use "sendTransaction" instead.'
        );
    }

}
