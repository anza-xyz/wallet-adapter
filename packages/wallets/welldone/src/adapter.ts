import type { EventEmitter, SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
import { WalletError, WalletSendTransactionError } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type { Connection, SendOptions, Transaction, TransactionSignature } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import base58 from 'bs58';

interface WELLDONEWalletEvents {
    connect(...args: unknown[]): unknown;
    'dapp:disconnect'(...args: unknown[]): unknown;
}

interface RequestParams {
    method: string;
    params?: object;
}

interface WELLDONEWallet extends EventEmitter<WELLDONEWalletEvents> {
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signAndSendTransaction(
        transaction: Transaction,
        options?: SendOptions
    ): Promise<{ signature: TransactionSignature }>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    disconnect(): Promise<void>;
    request: (chain: string, args: RequestParams) => Promise<any>;
}

interface WELLDONEWalletWindow extends Window {
    dapp?: WELLDONEWallet;
}

declare const window: WELLDONEWalletWindow;

export interface WELLDONEWalletAdapterConfig {}

export const WELLDONEWalletName = 'WELLDONE Wallet' as WalletName<'WELLDONE Wallet'>;

export class WELLDONEWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = WELLDONEWalletName;
    url = 'https://welldonestudio.io/';
    icon =
        'data:image/png;base64,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';
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: WELLDONEWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: WELLDONEWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.dapp) {
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
        return !!this._wallet;
    }

    get readyState() {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this._connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const wallet = window.dapp!;

            if (wallet) {
                try {
                    const account = await wallet.request('solana', { method: 'dapp:accounts' });

                    if (!account['solana'].pubKey) throw new WalletAccountError();

                    let publicKey: PublicKey;
                    try {
                        publicKey = new PublicKey(base58.decode(account['solana'].pubKey));
                    } catch (error: any) {
                        throw new WalletPublicKeyError(error?.message, error);
                    }

                    wallet.on('dapp:disconnect', this._disconnected);

                    this._wallet = wallet;
                    this._publicKey = publicKey;

                    this.emit('connect', publicKey);
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
                }
            }
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
            wallet.off('dapp:disconnect', this._disconnected);

            this._wallet = null;
            this._publicKey = null;
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
                const { signers, ...sendOptions } = options;

                transaction = await this.prepareTransaction(transaction, connection, sendOptions);

                const [hash] = await wallet.request('solana', {
                    method: 'dapp:sendTransaction',
                    params: [`0x${transaction.serialize({ verifySignatures: false }).toString('hex')}`],
                });

                return hash;
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletSendTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
        const message = 'signTransaction method is not supported';
        this.emit('error', message as any);
        throw new WalletSignTransactionError(message, new Error(message));
    }

    async signAllTransactions<T extends Transaction>(transactions: T[]): Promise<T[]> {
        const message = 'signAllTransactions method is not supported';
        this.emit('error', message as any);
        throw new WalletSignTransactionError(message, new Error(message));
    }

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const encoded = `0x${Buffer.from(message).toString('hex')}`;

                const signed = await wallet.request('solana', {
                    method: 'dapp:sign',
                    params: [encoded],
                });

                const signature = Buffer.from(signed.signature.replace('0x', ''), 'hex');

                return signature;
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
            wallet.off('dapp:disconnect', this._disconnected);

            this._wallet = null;
            this._publicKey = null;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };
}
