import {
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletName,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignTransactionError,
    BaseMessageSignerWalletAdapter
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
        sig?: string;
    }>;
}

interface Coin98Window extends Window {
    coin98?: {
        sol?: Coin98Wallet;
    };
}

declare const window: Coin98Window;

export interface Coin98WalletAdapterConfig {}

export const Coin98WalletName = 'Coin98' as WalletName;

export class Coin98WalletAdapter extends BaseMessageSignerWalletAdapter {
    name = Coin98WalletName;
    url = 'https://coin98.com';
    icon = 'data:image/png;base64,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';

    private _connecting: boolean;
    private _wallet: Coin98Wallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: Coin98WalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.coin98?.sol) {
                    this._readyState = WalletReadyState.Installed;
                    this.emit('readyStateChange', this._readyState);
                    return true;
                }
                return false;
            });
        }
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._wallet?.isConnected();
    }

    get readyState(): WalletReadyState {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this._connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const wallet = window!.coin98!.sol!;

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
            await this.sleep()
        }
        return signedTransactions;
    }


    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const decodedMessage = new TextDecoder().decode(message)
                
                const response = await wallet.request({ method: 'sol_sign', params: [decodedMessage] });

                const signature = new TextEncoder().encode(response.sig);

                return signature;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    //Ultilities
    sleep(ms = 500): Promise<boolean>{
        return new Promise(resolve => setTimeout(resolve, ms))
    }

}
