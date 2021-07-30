import {
    EventEmitter,
    WalletAdapter,
    WalletAdapterEvents,
    WalletConnectionError,
    WalletDisconnectionError,
    WalletError,
    WalletKeypairError,
    WalletNotConnectedError,
    WalletSignatureError,
    WalletWindowBlockedError,
    WalletWindowClosedError,
} from '@solana/wallet-adapter-base';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import OpenLogin, { OPENLOGIN_NETWORK, OPENLOGIN_NETWORK_TYPE } from '@toruslabs/openlogin';
import { getED25519Key } from '@toruslabs/openlogin-ed25519';

export interface TorusWalletAdapterConfig {
    clientId: string;
    network?: OPENLOGIN_NETWORK_TYPE;
}

export class TorusWalletAdapter extends EventEmitter<WalletAdapterEvents> implements WalletAdapter {
    private _keypair: Keypair | undefined;
    private _connecting: boolean;
    private _provider: OpenLogin | undefined;
    private _clientId: string;
    private _network: OPENLOGIN_NETWORK_TYPE;

    constructor(config: TorusWalletAdapterConfig) {
        super();
        this._connecting = false;
        this._clientId = config.clientId;
        this._network = config.network || OPENLOGIN_NETWORK.MAINNET;
    }

    get publicKey(): PublicKey | null {
        return this._keypair?.publicKey || null;
    }

    get ready(): boolean {
        return true;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._keypair;
    }

    get autoApprove(): boolean {
        return false;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            let provider: OpenLogin;
            let privateKey: string;
            try {
                provider = new OpenLogin({
                    clientId: this._clientId,
                    network: this._network,
                    uxMode: 'popup',
                });

                await provider.init();

                privateKey = provider.privKey;
                if (!privateKey) {
                    let listener: (event: { reason: any }) => void;
                    try {
                        privateKey = await new Promise((resolve, reject) => {
                            listener = ({ reason }) => {
                                switch (reason?.message) {
                                    case 'user closed popup':
                                        reason = new WalletWindowClosedError(reason.message, reason);
                                        break;
                                    case 'Unable to open window':
                                        reason = new WalletWindowBlockedError(reason.message, reason);
                                        break;
                                }
                                reject(reason);
                            };

                            window.addEventListener('unhandledrejection', listener);

                            provider.login().then(
                                // HACK: result.privKey is incorrect, use provider.privKey
                                (result) => resolve(provider.privKey),
                                (reason) => listener({ reason })
                            );
                        });
                    } finally {
                        window.removeEventListener('unhandledrejection', listener!);
                    }
                }
            } catch (error) {
                if (error instanceof WalletError) throw error;
                throw new WalletConnectionError(error?.message, error);
            }

            let keypair: Keypair;
            try {
                keypair = Keypair.fromSecretKey(getED25519Key(privateKey).sk);
            } catch (error) {
                throw new WalletKeypairError(error?.message, error);
            }

            this._keypair = keypair;
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
            this._keypair = undefined;
            this._provider = undefined;

            try {
                await provider.logout();
                await provider._cleanup();
            } catch (error) {
                this.emit('error', new WalletDisconnectionError(error.message, error));
            }

            this.emit('disconnect');
        }
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            const keypair = this._keypair;
            if (!keypair) throw new WalletNotConnectedError();

            try {
                transaction.partialSign(keypair);
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
            const keypair = this._keypair;
            if (!keypair) throw new WalletNotConnectedError();

            try {
                for (const transaction of transactions) {
                    transaction.partialSign(keypair);
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
