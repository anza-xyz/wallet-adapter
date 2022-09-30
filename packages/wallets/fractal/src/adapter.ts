import base58 from 'bs58';
import {
    SendTransactionOptions,
    TransactionOrVersionedTransaction,
    WalletError,
    WalletNotConnectedError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type { WalletName } from '@solana/wallet-adapter-base';
import {
    BaseSignerWalletAdapter,
    WalletReadyState,
    WalletConnectionError,
    WalletPublicKeyError,
    WalletNotReadyError,
} from '@solana/wallet-adapter-base';
import { Message, Transaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import {
    ConnectionManager,
    Platform,
    PopupEvent,
    assertPayloadIsSolanaWalletAdapterApproved,
    DEFAULT_POPUP_HEIGHT_PX,
    assertPayloadIsTransactionSignatureNeededResponsePayload,
} from '@fractalwagmi/popup-connection';
import type { TransactionSignatureNeededPayload } from '@fractalwagmi/popup-connection';
import uuid from 'uuid';

const FRACTAL_DOMAIN_HTTPS = 'https://fractal.is';
const APPROVE_PAGE_URL = `${FRACTAL_DOMAIN_HTTPS}/wallet-adapter/approve`;
const SIGN_PAGE_URL = `${FRACTAL_DOMAIN_HTTPS}/wallet-adapter/sign`;
const MIN_POPUP_HEIGHT_PX = DEFAULT_POPUP_HEIGHT_PX;
const MAX_POPUP_WIDTH_PX = 850;

export const FractalWalletName = 'Fractal Wallet' as WalletName<'Fractal Wallet'>;

export class FractalWalletAdapter extends BaseSignerWalletAdapter {
    name = FractalWalletName;
    url = 'https://github.com/solana-labs/wallet-adapter#usage';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDEwMDAiPjxwYXRoIGQ9Ik0zNDIuMjQgNzYzLjkzVjI0My44Mkg3MTV2MTEyLjY5SDQ4MXYxMTUuNThoMTgydjExMi42OUg0ODF2MTc5LjE1WiIgc3R5bGU9ImZpbGw6I2RlMzU5YyIvPjwvc3ZnPg==';
    private _publicKey: PublicKey | null = null;
    private _connecting = false;
    readonly supportedTransactionVersions = null;

    private popupManager = new ConnectionManager(Platform.SOLANA_WALLET_ADAPTER);

    constructor() {
        super();
    }

    get connecting() {
        return this._connecting;
    }

    get publicKey() {
        return this._publicKey;
    }

    get readyState() {
        return WalletReadyState.Loadable;
    }

    async connect(): Promise<void> {
        let resolve: () => void | undefined;
        let reject: (err: unknown) => void | undefined;

        this._connecting = true;
        const nonce = uuid.v4();
        this.popupManager.open({
            url: `${APPROVE_PAGE_URL}/${nonce}`,
            nonce,
        });

        const handleSolanaWalletAdapterApproved = (payload: unknown) => {
            if (!assertPayloadIsSolanaWalletAdapterApproved(payload)) {
                reject(
                    new WalletConnectionError(
                        'Malformed payload when setting up connection. ' +
                            'Expected { solanaPublicKey: string } but ' +
                            `received ${payload}`
                    )
                );
                return;
            }
            try {
                this._publicKey = new PublicKey(payload.solanaPublicKey);
                resolve();
                this.emit('connect', this._publicKey);
            } catch (error: any) {
                const publicKeyError = new WalletPublicKeyError(error?.message, error);
                reject(publicKeyError);
                this.emit('error', publicKeyError);
            }
            this._connecting = false;
        };

        this.popupManager.onConnectionUpdated((connection) => {
            if (!connection) {
                return;
            }
            connection.on(PopupEvent.SOLANA_WALLET_ADAPTER_APPROVED, handleSolanaWalletAdapterApproved);
        });

        return new Promise((promiseResolver, promiseRejector) => {
            resolve = promiseResolver;
            reject = promiseRejector;
        });
    }

    async disconnect(): Promise<void> {
        this.popupManager.tearDown();
        this._publicKey = null;
        this.emit('disconnect');
    }

    async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
        try {
            this.checkWalletReadiness();
            const result = await this.signTransactions([transaction]);
            return result[0];
        } catch (error: any) {
            let errorToThrow = error;
            if (!(error instanceof WalletError)) {
                errorToThrow = new WalletSignTransactionError(error?.message, error);
            }
            this.emit('error', errorToThrow);
            throw error;
        }
    }

    async signAllTransactions<T extends Transaction>(transactions: T[]): Promise<T[]> {
        try {
            this.checkWalletReadiness();
            const result = await this.signTransactions(transactions);
            return result;
        } catch (error: any) {
            let errorToThrow = error;
            if (!(error instanceof WalletError)) {
                errorToThrow = new WalletSignTransactionError(error?.message, error);
            }
            this.emit('error', errorToThrow);
            throw error;
        }
    }

    private async signTransactions<T extends Transaction>(transactions: T[]): Promise<T[]> {
        let resolve: (signedTransactions: T[]) => void;
        let reject: (err: WalletError) => void;

        const handleTransactionSignatureNeededResponse = (payload: unknown) => {
            if (!assertPayloadIsTransactionSignatureNeededResponsePayload(payload)) {
                const error = new WalletSignTransactionError(
                    'Malformed payload when signing transactions. ' +
                        'Expected { signedB58Transactions: string[] } ' +
                        `but received ${payload}`
                );
                reject(error);
                this.emit('error', error);
                return;
            }

            const signedTransactions = payload.signedB58Transactions.map((signedB58Transaction) => {
                const message = Message.from(base58.decode(signedB58Transaction));
                return Transaction.populate(message);
            }) as T[];

            resolve(signedTransactions);
        };

        const nonce = uuid.v4();
        this.popupManager.open({
            url: `${SIGN_PAGE_URL}/${nonce}`,
            nonce,
            heightPx: Math.max(MIN_POPUP_HEIGHT_PX, Math.floor(window.innerHeight * 0.8)),
            widthPx: Math.min(MAX_POPUP_WIDTH_PX, Math.floor(window.innerWidth * 0.8)),
        });
        this.popupManager.onConnectionUpdated((connection) => {
            if (!connection) {
                return;
            }

            connection.on(PopupEvent.TRANSACTION_SIGNATURE_NEEDED_RESPONSE, handleTransactionSignatureNeededResponse);

            const payload: TransactionSignatureNeededPayload = {
                unsignedB58Transactions: transactions.map((t) => base58.encode(t.serializeMessage())),
            };
            connection.send({
                event: PopupEvent.TRANSACTION_SIGNATURE_NEEDED,
                payload,
            });
        });

        return new Promise<T[]>((promiseResolver, promiseRejector) => {
            resolve = promiseResolver;
            reject = promiseRejector;
        });
    }

    private checkWalletReadiness() {
        if (this.publicKey === null) {
            throw new WalletNotConnectedError('`publicKey` is null. Did you forget to call `.connect()`?');
        }
        if (this.connecting) {
            throw new WalletNotReadyError('`signTransaction` cannot be called while connecting');
        }
    }
}
