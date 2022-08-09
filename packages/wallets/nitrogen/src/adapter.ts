/* eslint-disable no-underscore-dangle */
import type {
    EventEmitter,
    WalletName,
} from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    WalletAccountError,
    WalletConnectionError,
    WalletError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignMessageError,
    WalletSignTransactionError,
    scopePollingDetectionStrategy,
} from '@solana/wallet-adapter-base';
import type { SendOptions, Transaction, TransactionSignature } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

interface NitrogenWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface NitrogenWallet extends EventEmitter<NitrogenWalletEvents> {
    _handleDisconnect(...args: unknown[]): unknown;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected: boolean;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signAndSendTransaction(
        transaction: Transaction,
        options?: SendOptions
    ): Promise<{ signature: TransactionSignature }>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    isNitrogen?: boolean;
    publicKey?: { toBytes(): Uint8Array };
}

interface NitrogenWindow extends Window {
    solana?: NitrogenWallet;
}

declare const window: NitrogenWindow;

export interface NitrogenWalletAdapterConfig { }

export const NitrogenWalletName = 'Nitrogen' as WalletName;

export class NitrogenWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = NitrogenWalletName;
    url = 'https://nitrogen.app';
    // eslint-disable-next-line max-len
    icon = 'data:image/png;base64,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';

    private _connecting: boolean;
    private _wallet: any | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState = typeof window === 'undefined' || typeof document === 'undefined'
        ? WalletReadyState.Unsupported
        : WalletReadyState.NotDetected;

    constructor(config: NitrogenWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window?.nitrogen?.isNitrogen) {
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
        return !!this._wallet?.isConnected;
    }

    get readyState(): WalletReadyState {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Installed) {
                throw new WalletNotReadyError();
            }

            this._connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const wallet = window!.nitrogen!.solana;

            if (!wallet.isConnected) {
                try {
                    await new Promise<void>((resolve, reject) => {
                        wallet.connect()
                            .then(({ publicKey }) => {
                                wallet.publicKey = publicKey;
                                resolve();
                            })
                            .catch((reason: any) => {
                                reject(reason);
                            });
                    });
                } catch (error: any) {
                    if (error instanceof WalletError) throw error;
                    throw new WalletConnectionError(error?.message, error);
                }
            }

            if (!wallet.publicKey) throw new WalletAccountError();

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(wallet.publicKey);
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            this._wallet = wallet;
            this._publicKey = publicKey;
            this._wallet.isConnected = true;
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
        }

        this.emit('disconnect');
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            const wallet = this._wallet;
            if (!wallet || !this.publicKey) throw new WalletNotConnectedError();

            try {
                const { signature } = await wallet.signTransaction({
                    message: bs58.encode(transaction.serializeMessage()),
                    pubkey: this.publicKey.toString(),
                });

                if (!signature) {
                    throw new WalletSignTransactionError();
                }

                transaction.addSignature(this.publicKey, bs58.decode(signature));
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
        try {
            const wallet = this._wallet;
            if (!wallet || !this.publicKey) throw new WalletNotConnectedError();

            try {
                const signatures = await wallet.signTransaction(transactions.map((transaction) => ({
                    message: bs58.encode(transaction.serializeMessage()),
                    pubkey: this.publicKey?.toString(),
                })));

                if (signatures.length) {
                    transactions.forEach((transaction, i) => {
                        if (!signatures[i] || !this.publicKey) {
                            throw new WalletSignTransactionError();
                        }
                        transaction.addSignature(this.publicKey, bs58.decode(signatures[i]));
                    });
                }
                return transactions;
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
                const { signature } = await wallet.signMessage({
                    message,
                    pubkey: this.publicKey?.toString(),
                });

                if (!signature) {
                    throw new WalletSignTransactionError();
                }

                return signature;
            } catch (error: any) {
                throw new WalletSignMessageError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
}
