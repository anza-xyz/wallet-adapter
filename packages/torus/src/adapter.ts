import {
    BaseSignerWalletAdapter,
    WalletConnectionError,
    WalletDisconnectionError,
    WalletError,
    WalletKeypairError,
    WalletNotConnectedError,
    WalletSignTransactionError,
    WalletWindowBlockedError,
    WalletWindowClosedError,
} from '@solana/wallet-adapter-base';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import OpenLogin, { OPENLOGIN_NETWORK, OpenLoginOptions } from '@toruslabs/openlogin';
import { getED25519Key } from '@toruslabs/openlogin-ed25519';

export interface TorusWalletAdapterConfig {
    options: Partial<OpenLoginOptions> & Omit<OpenLoginOptions, 'network'>;
}

export class TorusWalletAdapter extends BaseSignerWalletAdapter {
    private _options: OpenLoginOptions;
    private _connecting: boolean;
    private _openLogin: OpenLogin | null;
    private _keypair: Keypair | null;

    constructor(config: TorusWalletAdapterConfig) {
        super();
        this._options = { uxMode: 'popup', network: OPENLOGIN_NETWORK.MAINNET, ...config.options };
        this._connecting = false;
        this._openLogin = null;
        this._keypair = null;
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

            let openLogin: OpenLogin;
            let privateKey: string;
            try {
                openLogin = new OpenLogin(this._options);

                await openLogin.init();

                privateKey = openLogin.privKey;
                if (!privateKey) {
                    let listener: (event: { reason: any }) => void;
                    try {
                        privateKey = await new Promise((resolve, reject) => {
                            listener = ({ reason }) => {
                                switch (reason?.message.toLowerCase()) {
                                    case 'user closed popup':
                                        reason = new WalletWindowClosedError(reason.message, reason);
                                        break;
                                    case 'unable to open window':
                                        reason = new WalletWindowBlockedError(reason.message, reason);
                                        break;
                                }
                                reject(reason);
                            };

                            window.addEventListener('unhandledrejection', listener);

                            openLogin.login().then(
                                // HACK: result.privKey is not padded to 64 bytes, use provider.privKey
                                (result) => resolve(openLogin.privKey),
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

            this._openLogin = openLogin;
            this._keypair = keypair;

            this.emit('connect');
        } catch (error) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        const openLogin = this._openLogin;
        if (openLogin) {
            this._openLogin = null;
            this._keypair = null;

            try {
                await openLogin.logout();
                await openLogin._cleanup();
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
                throw new WalletSignTransactionError(error?.message, error);
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
                throw new WalletSignTransactionError(error?.message, error);
            }

            return transactions;
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
}
