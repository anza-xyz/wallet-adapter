import {
    BaseSignerWalletAdapter,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletError,
    WalletNotConnectedError,
    WalletPublicKeyError,
    WalletSignTransactionError,
    WalletWindowClosedError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';
import WalletConnectClient, { CLIENT_EVENTS } from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import { ClientOptions, ClientTypes, PairingTypes, SessionTypes } from '@walletconnect/types';
import bs58 from 'bs58';

export enum WalletConnectChainID {
    Mainnet = 'solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ',
    Devnet = 'solana:8E9rvCKLFQia2Y35HXjjpWzj8weVo44K',
}

export enum WalletConnectRPCMethod {
    SOL_SIGN_TRANSACTION = 'sol_signTransaction',
}

export interface WalletConnectWalletAdapterConfig {
    options: ClientOptions;
    params?: ClientTypes.ConnectParams;
}

export class WalletConnectWalletAdapter extends BaseSignerWalletAdapter {
    private _publicKey: PublicKey | null;
    private _connecting: boolean;
    private _options: ClientOptions;
    private _params: ClientTypes.ConnectParams;
    private _client: WalletConnectClient | undefined;

    private _session?: SessionTypes.Created;

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

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            let client: WalletConnectClient;
            let session: SessionTypes.Settled;
            try {
                client = await WalletConnectClient.init(this._options);

                // eslint-disable-next-line no-async-promise-executor
                session = await new Promise<SessionTypes.Settled>(async (resolve, reject) => {
                    let session: SessionTypes.Settled;

                    async function onPairingProposal(proposal: PairingTypes.Proposal) {
                        console.log('onPairingProposal');
                        const { uri } = proposal.signal.params;

                        QRCodeModal.open(uri, () => {
                            cleanup();
                            reject(new WalletWindowClosedError());
                        });
                    }

                    async function onPairingCreated(created: PairingTypes.Created) {
                        console.log('onPairingCreated');
                    }

                    async function onSessionProposal(proposal: SessionTypes.Proposal) {
                        console.log('onSessionProposal', proposal);
                    }

                    async function onSessionCreated(created: SessionTypes.Created) {
                        console.log('onSessionCreated', created);
                        resolve(created);
                    }

                    function cleanup() {
                        client.off(CLIENT_EVENTS.pairing.proposal, onPairingProposal);
                        client.off(CLIENT_EVENTS.pairing.created, onPairingCreated);
                        client.off(CLIENT_EVENTS.session.proposal, onSessionProposal);
                        client.off(CLIENT_EVENTS.session.created, onSessionCreated);
                    }

                    try {
                        client.on(CLIENT_EVENTS.pairing.proposal, onPairingProposal);
                        client.on(CLIENT_EVENTS.pairing.created, onPairingCreated);
                        client.on(CLIENT_EVENTS.session.proposal, onSessionProposal);
                        client.on(CLIENT_EVENTS.session.created, onSessionCreated);

                        session = await client.connect(this._params);
                        resolve(session);
                    } catch (error: any) {
                        cleanup();
                        reject(error);
                    }
                });
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletConnectionError(error?.message, error);
            }

            if (!session.state.accounts.length) throw new WalletAccountError();

            const match = session.state.accounts[0].match(/:([0-9a-zA-Z]+)$/);
            if (!match) throw new WalletAccountError();
            const account = match[1];

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(account);
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            client.on(CLIENT_EVENTS.session.deleted, this._disconnected);

            this._publicKey = publicKey;
            this._client = client;
            this._session = session;

            QRCodeModal.close();
            this.emit('connect');
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        const client = this._client;
        if (client && this._session) {
            try {
                await client.disconnect({
                    topic: this._session.topic,
                    reason: { code: 0, message: '' },
                });
            } catch (error: any) {
                this.emit('error', new WalletDisconnectionError(error?.message, error));
            } finally {
                this._publicKey = null;
                this._client = undefined;
                this._session = undefined;
            }
        }

        this.emit('disconnect');
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            const client = this._client;
            const publicKey = this._publicKey;
            if (!client || !publicKey || !this._session) throw new WalletNotConnectedError();

            try {
                const signature = await client.request({
                    topic: this._session.topic,
                    request: {
                        method: WalletConnectRPCMethod.SOL_SIGN_TRANSACTION,
                        params: {
                            feePayer: transaction.feePayer!.toBase58(),
                            instructions: transaction.instructions.map((i) => ({
                                programId: i.programId.toBase58(),
                                data: bs58.encode(i.data),
                                keys: i.keys.map((k) => ({
                                    isSigner: k.isSigner,
                                    isWritable: k.isWritable,
                                    pubkey: k.pubkey.toBase58(),
                                })),
                            })),
                            recentBlockhash: transaction.recentBlockhash,
                        },
                    },
                });

                transaction.addSignature(publicKey, bs58.decode(signature));
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }

            return transaction;
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        try {
            const client = this._client;
            const publicKey = this._publicKey;
            if (!client || !publicKey || !this._session) throw new WalletNotConnectedError();

            try {
                for (const transaction of transactions) {
                    const signature = await client.request({
                        topic: this._session.topic,
                        request: {
                            method: WalletConnectRPCMethod.SOL_SIGN_TRANSACTION,
                            params: transaction,
                        },
                    });

                    transaction.addSignature(publicKey, signature);
                }
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }

            return transactions;
        } catch (error: any) {
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
            this._session = undefined;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };
}
