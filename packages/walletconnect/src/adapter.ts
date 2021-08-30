import {
    BaseSignerWalletAdapter,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletNotConnectedError,
    WalletPublicKeyError,
    WalletSignTransactionError,
    WalletWindowClosedError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';
import WalletConnectClient, { CLIENT_EVENTS } from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import { ClientOptions, ClientTypes, PairingTypes, SessionTypes } from '@walletconnect/types';

export enum WalletConnectChainID {
    Mainnet = 'solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ',
    Devnet = 'solana:8E9rvCKLFQia2Y35HXjjpWzj8weVo44K',
}

export enum WalletConnectRPCMethod {
    SOL_SIGN_TRANSACTION = 'sol_signTransaction',
}

export interface WalletConnectWalletAdapterConfig {
    chainId: WalletConnectChainID;
    options: ClientOptions;
    params?: ClientTypes.ConnectParams;
}

export class WalletConnectWalletAdapter extends BaseSignerWalletAdapter {
    private _publicKey: PublicKey | null;
    private _connecting: boolean;
    private _options: ClientOptions;
    private _params: ClientTypes.ConnectParams;
    private _client: WalletConnectClient | undefined;

    constructor(config: WalletConnectWalletAdapterConfig) {
        super();

        this._publicKey = null;
        this._connecting = false;
        this._options = config.options;
        this._params = config.params || {
            permissions: {
                blockchain: { chains: [WalletConnectChainID.Mainnet, WalletConnectChainID.Devnet] },
                jsonrpc: { methods: [WalletConnectRPCMethod.SOL_SIGN_TRANSACTION] },
            },
        };
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get ready(): boolean {
        return typeof window !== 'undefined';
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._publicKey;
    }

    get autoApprove(): boolean {
        return false;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            let client: WalletConnectClient;
            let session: SessionTypes.Settled;
            try {
                client = await WalletConnectClient.init(this._options);

                session = await new Promise<SessionTypes.Settled>(async (resolve, reject) => {
                    let session: SessionTypes.Settled;

                    async function onPairingProposal(proposal: PairingTypes.Proposal) {
                        const { uri } = proposal.signal.params;
                        QRCodeModal.open(uri, () => {
                            cleanup();
                            reject(new WalletWindowClosedError());
                        });
                    }

                    async function onPairingCreated(created: PairingTypes.Created) {
                        cleanup();
                        resolve(session);
                    }

                    function cleanup() {
                        client.off(CLIENT_EVENTS.pairing.proposal, onPairingProposal);
                        client.off(CLIENT_EVENTS.pairing.created, onPairingCreated);
                    }

                    try {
                        client.on(CLIENT_EVENTS.pairing.proposal, onPairingProposal);
                        client.on(CLIENT_EVENTS.pairing.created, onPairingCreated);

                        session = await client.connect(this._params);
                    } catch (error) {
                        cleanup();
                        reject(error);
                    }
                });
            } catch (error) {
                throw new WalletConnectionError(error.message, error);
            }

            if (!session.state.accounts.length) throw new WalletAccountError();

            const match = session.state.accounts[0].match(/:([0-9a-zA-Z]+)$/);
            if (!match) throw new WalletAccountError();
            const account = match[1];

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(account);
            } catch (error) {
                throw new WalletPublicKeyError(error.message, error);
            }

            client.on(CLIENT_EVENTS.session.deleted, this._disconnected);

            this._publicKey = publicKey;
            this._client = client;
            this.emit('connect');
        } catch (error) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        const client = this._client;
        if (client) {
            this._publicKey = null;
            this._client = undefined;

            try {
                // @FIXME
                await client.disconnect({
                    topic: '',
                    reason: { code: 0, message: '' },
                });
            } catch (error) {
                this.emit('error', new WalletDisconnectionError(error.message, error));
            }

            this.emit('disconnect');
        }
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            const client = this._client;
            const publicKey = this._publicKey;
            if (!client || !publicKey) throw new WalletNotConnectedError();

            try {
                const signature = await client.request({
                    topic: '', // @FIXME
                    request: {
                        method: WalletConnectRPCMethod.SOL_SIGN_TRANSACTION,
                        params: transaction,
                    },
                });

                transaction.addSignature(publicKey, signature);
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
            const client = this._client;
            const publicKey = this._publicKey;
            if (!client || !publicKey) throw new WalletNotConnectedError();

            try {
                for (const transaction of transactions) {
                    const signature = await client.request({
                        topic: '', // @FIXME
                        request: {
                            method: WalletConnectRPCMethod.SOL_SIGN_TRANSACTION,
                            params: transaction,
                        },
                    });

                    transaction.addSignature(publicKey, signature);
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

    private _disconnected = () => {
        const client = this._client;
        if (client) {
            client.off(CLIENT_EVENTS.session.deleted, this._disconnected);

            this._publicKey = null;
            this._client = undefined;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };
}
