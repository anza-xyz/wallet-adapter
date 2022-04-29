import type SolWalletAdapter from '@project-serum/sol-wallet-adapter';
import base58 from 'bs58';
import {
    BaseMessageSignerWalletAdapter,
    scopePollingDetectionStrategy,
    WalletAdapterNetwork,
    WalletConfigError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletError,
    WalletLoadError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignMessageError,
    WalletSignTransactionError,
    WalletTimeoutError,
    WalletWindowBlockedError,
    WalletWindowClosedError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';

//  used in the future when Fractal Wallet adds an extension
interface FractalWallet {
    postMessage(...args: unknown[]): unknown;
}

interface FractalWindow extends Window {
    fractal?: FractalWallet;
}

declare const window: FractalWindow;

export interface FractalWalletAdapterConfig {
    provider?: string;
    network?: WalletAdapterNetwork;
    timeout?: number;
}

interface Request {
    method: string;
    params: Record<string, unknown>;
}

interface PopupHandler {
    onClose: () => void;
    onConnect: (publicKey: PublicKey, autoApprove: boolean) => void;
    onDisconnect: () => void;
}
class Popup {
    private _popup: WindowProxy;
    private _timerHandle: NodeJS.Timeout;
    private _network: string;
    private _url: URL;
    private _handler: PopupHandler;
    private _pendingRequests: Record<string, { resolve: (res: unknown) => void; reject: (err: Error) => void }>;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private _connectedRes: () => void = () => {};
    private _connectedPromise: Promise<void>;
    private _autoApprove = false;

    constructor(
        url: string,
        network: string,
        handler: PopupHandler,
        //  TODO: handle this
        oneOffRequest?: Request
    ) {
        this._timerHandle = setInterval(() => {
            if (this._popup.closed) {
                handler.onClose();
                clearInterval(this._timerHandle);
            }
        }, 500);

        const popup = window.open(
            url,
            'fractal-wallet-popup',
            `location,resizable,width=460,height=675,left=${document.documentElement.clientWidth - 460}`
        );
        if (!popup) {
            throw new WalletConnectionError('popup is null');
        }
        this._popup = popup;
        this._network = network;
        this._url = new URL(url);
        this._pendingRequests = {};
        this._handler = handler;

        this._connectedPromise = new Promise((res, rej) => {
            this._connectedRes = res;
        });

        window.addEventListener('message', this.handleMessage.bind(this));
    }

    handleMessage(
        ev: MessageEvent<{
            id: string;
            method: string;
            params: {
                autoApprove: boolean;
                publicKey: string;
            };
            result?: unknown;
            error?: string;
        }>
    ) {
        if (ev.origin !== this._url.origin) {
            return;
        }
        if (this._pendingRequests[ev.data.id]) {
            const { resolve, reject } = this._pendingRequests[ev.data.id];
            if (ev.data.result) {
                resolve(ev.data.result as object);
            } else if (ev.data.error) {
                reject(new Error(ev.data.error));
            }
            delete this._pendingRequests[ev.data.id];
        }
        if (ev.data.method === 'connected') {
            this._autoApprove = ev.data.params.autoApprove;
            const newPublicKey = new PublicKey(ev.data.params.publicKey);
            this._handler.onConnect(newPublicKey, !!ev.data.params.autoApprove);
            this._connectedRes();
        }
        if (ev.data.method === 'disconnected') {
            this._handler.onDisconnect();
        }
    }

    async sendRequest(req: Request): Promise<unknown> {
        await this._connectedPromise;
        const reqId = crypto.randomUUID();
        this._popup.postMessage(
            {
                jsonrpc: '2.0',
                id: reqId,
                method: req.method,
                params: {
                    network: this._network,
                    ...req.params,
                },
            },
            this._url.origin
        );
        const promise = new Promise<unknown>((res, rej) => {
            this._pendingRequests[reqId] = { resolve: res, reject: rej };
        });
        if (!this._autoApprove) {
            this._popup.focus();
        }
        return promise;
    }

    close() {
        this._popup.close();
        clearInterval(this._timerHandle);
        for (const [id, { reject }] of Object.entries(this._pendingRequests)) {
            reject(new WalletDisconnectedError('popup closed with pending request'));
            delete this._pendingRequests[id];
        }
    }
}

export abstract class BaseFractalWalletAdapter extends BaseMessageSignerWalletAdapter {
    protected _provider: string;
    protected _network: WalletAdapterNetwork;
    protected _timeout: number;
    protected _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;
    protected _connecting: boolean;
    //  NOTE: we allow the wallet to remain "connected" even after the popup is
    //  closed so that the user doesn't have to keep it open
    protected _connected = false;
    protected _publicKey: PublicKey | null;

    protected _popup: Popup | null;

    constructor({
        provider,
        network = WalletAdapterNetwork.Mainnet,
        timeout = 10000,
    }: FractalWalletAdapterConfig = {}) {
        super();

        if (!provider) {
            throw new WalletConfigError('no provider specified');
        }

        this._provider = provider;
        this._network = network;
        this._timeout = timeout;
        this._connecting = false;
        this._publicKey = null;

        this._popup = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            if (typeof this._provider === 'string') {
                this._readyState = WalletReadyState.Loadable;
            } else {
                scopePollingDetectionStrategy(() => {
                    if (typeof window.fractal?.postMessage === 'function') {
                        this._readyState = WalletReadyState.Installed;
                        this.emit('readyStateChange', this._readyState);
                        return true;
                    }
                    return false;
                });
            }
        }
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return this._connected;
    }

    get readyState(): WalletReadyState {
        return this._readyState;
    }

    async connect(): Promise<void> {
        this._connect();
    }

    private async _connect(oneOffRequest?: Request) {
        if (this._popup) return;
        if (!(this._readyState === WalletReadyState.Loadable || this._readyState === WalletReadyState.Installed))
            throw new WalletNotReadyError();

        this._connecting = true;

        const provider = this._provider;

        let connRes: () => void;
        let connRej: (_: Error) => void;
        const connPromise = new Promise<void>((res, rej) => {
            connRes = res;
            connRej = rej;
        });

        this._popup = new Popup(
            provider,
            this._network,
            {
                onClose: () => {
                    console.log('closed');
                    connRej(new Error('closed'));
                    this._popup = null;
                    this._connecting = false;
                },
                onConnect: (publicKey: PublicKey, autoApprove: boolean) => {
                    this._connecting = false;
                    this._connected = true;
                    this._publicKey = publicKey;
                    this.emit('connect', publicKey);
                    connRes();
                    console.log('connected');
                },
                onDisconnect: () => {
                    connRej(new Error('disconnected'));
                    console.log('disconnected');
                    this.disconnect();
                },
            },
            oneOffRequest
        );

        return connPromise.catch((e) => {
            this.emit('error', e);
            throw e;
        });
    }

    async disconnect(): Promise<void> {
        this._popup?.close();
        this._popup = null;
        this._connecting = false;
        this._connected = false;

        this.emit('disconnect');
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            await this.connect();
            if (!this._popup) {
                throw new WalletNotConnectedError();
            }
            try {
                const res = (await this._popup.sendRequest({
                    method: 'signTransaction',
                    params: {
                        message: base58.encode(transaction.serializeMessage()),
                    },
                })) as { signature: string; publicKey: string };
                const sig = base58.decode(res.signature);
                transaction.addSignature(new PublicKey(res.publicKey), sig);

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
            await this.connect();
            if (!this._popup) {
                throw new WalletNotConnectedError();
            }
            try {
                const res = (await this._popup.sendRequest({
                    method: 'signTransactions',
                    params: {
                        messages: transactions.map((txn) => base58.encode(txn.serializeMessage())),
                    },
                })) as { signatures: string[]; publicKey: string };
                const pk = new PublicKey(res.publicKey);
                transactions.map((txn, idx) => {
                    txn.addSignature(pk, base58.decode(res.signatures[idx]));
                });
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
        return transactions;
    }

    async signMessage(data: Uint8Array): Promise<Uint8Array> {
        try {
            await this.connect();
            if (!this._popup) {
                throw new WalletNotConnectedError();
            }
            try {
                const res = (await this._popup.sendRequest({
                    method: 'sign',
                    params: {
                        data,
                        display: 'utf8',
                    },
                })) as { signature: string; publicKey: string };
                const sig = base58.decode(res.signature);

                return sig;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
}
