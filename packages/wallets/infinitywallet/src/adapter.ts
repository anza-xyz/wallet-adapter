import type { EventEmitter, SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
import {
    BaseSignerWalletAdapter,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSendTransactionError,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type { Connection, SendOptions, Transaction, TransactionSignature } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

interface InfinityWalletWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}
interface InfinityWallet extends EventEmitter<InfinityWalletWalletEvents> {
    isInfinityWallet?: boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getAccount(): Promise<string>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signAndSendTransaction(
        transaction: Transaction,
        options?: SendOptions
    ): Promise<{ signature: TransactionSignature }>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
}

interface InfinityWalletWindow extends Window {
    solana?: InfinityWallet;
}

declare const window: InfinityWalletWindow;

export interface InfinityWalletAdapterConfig {}

export const InfinityWalletName = 'InfinityWallet' as WalletName<'InfinityWallet'>;

export class InfinityWalletAdapter extends BaseSignerWalletAdapter {
    name = InfinityWalletName;
    _url = 'https://infinitywallet.io/download';
    icon ='data:image/png;base64,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';

    private _connecting: boolean;
    private _wallet: InfinityWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: InfinityWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.solana?.isInfinityWallet) {
                    this._readyState = WalletReadyState.Installed;
                    this.emit('readyStateChange', this._readyState);
                    return true;
                }
                return false;
            });
        }
    }
    get url(): string {
        openInfinityWallet(window.location.href)
        return this._url
    }
    set url(url) {
      this._url = url
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
            if (this._connecting) return;
            if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this._connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const wallet = window!.solana!;

            let account: string;
            try {
                // @TODO: handle if popup is blocked
                account = await wallet.getAccount();
            } catch (error: any) {
                throw new WalletAccountError(error?.message, error);
            }

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(account);
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            window.addEventListener('message', this._messaged);

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
        if (this._wallet) {
            window.removeEventListener('message', this._messaged);

            this._wallet = null;
            this._publicKey = null;
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
                const { signature } = await wallet.signMessage(message);
                return signature;
            } catch (error: any) {
                throw new WalletSignMessageError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
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
                const { signature } = await wallet.signAndSendTransaction(transaction);
                return signature;
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletSendTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    private _messaged = (event: MessageEvent) => {
        const data = event.data;
        if (data && data.origin === 'infinitywallet_internal' && data.type === 'lockStatusChanged' && !data.payload) {
            this._disconnected();
        }
    };

    private _disconnected = () => {
        if (this._wallet) {
            window.removeEventListener('message', this._messaged);

            this._wallet = null;
            this._publicKey = null;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };
}
export function openInfinityWallet(hostname: string){
	if(hostname.includes('://'))
		hostname = hostname.split('://')[1]
	  hostname = encodeURIComponent(hostname)
	  window.open("infinity:?dapp="+hostname+"&chain=501");
}
