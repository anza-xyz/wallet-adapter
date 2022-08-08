import type { WalletName } from '@solana/wallet-adapter-base';
import {
    BaseSignerWalletAdapter,
    WalletAccountError,
    WalletAdapterNetwork,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignMessageError,
    WalletSignTransactionError,
    WalletWindowClosedError,
} from '@solana/wallet-adapter-base';
import type { Transaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import WalletConnectClient from '@walletconnect/sign-client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import type { EngineTypes, SessionTypes, SignClientTypes } from '@walletconnect/types';
import { getSdkError, parseAccountId } from '@walletconnect/utils';
import base58 from 'bs58';

export enum WalletConnectChainID {
    Mainnet = 'solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ',
    Devnet = 'solana:8E9rvCKLFQia2Y35HXjjpWzj8weVo44K',
}

export enum WalletConnectRPCMethod {
    signTransaction = 'solana_signTransaction',
    signMessage = 'solana_signMessage',
}

const getWalletConnectParams = (chainId: WalletConnectChainID, pairingTopic?: string): EngineTypes.ConnectParams => ({
    requiredNamespaces: {
        solana: {
            chains: [chainId],
            methods: [WalletConnectRPCMethod.signTransaction, WalletConnectRPCMethod.signMessage],
            events: [],
        },
    },
    pairingTopic,
});

const getChainId = (network: WalletAdapterNetwork): WalletConnectChainID => {
    switch (network) {
        case WalletAdapterNetwork.Mainnet:
            return WalletConnectChainID.Mainnet;
        case WalletAdapterNetwork.Devnet:
        default:
            return WalletConnectChainID.Devnet;
    }
};

export interface WalletConnectWalletAdapterConfig {
    network: WalletAdapterNetwork;
    options: SignClientTypes.Options;
}

export const WalletConnectWalletName = 'WalletConnect' as WalletName;

export class WalletConnectWalletAdapter extends BaseSignerWalletAdapter {
    name = WalletConnectWalletName;
    url = 'https://walletconnect.org';
    icon =
        'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE4NSIgdmlld0JveD0iMCAwIDMwMCAxODUiIHdpZHRoPSIzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTYxLjQzODU0MjkgMzYuMjU2MjYxMmM0OC45MTEyMjQxLTQ3Ljg4ODE2NjMgMTI4LjIxMTk4NzEtNDcuODg4MTY2MyAxNzcuMTIzMjA5MSAwbDUuODg2NTQ1IDUuNzYzNDE3NGMyLjQ0NTU2MSAyLjM5NDQwODEgMi40NDU1NjEgNi4yNzY1MTEyIDAgOC42NzA5MjA0bC0yMC4xMzY2OTUgMTkuNzE1NTAzYy0xLjIyMjc4MSAxLjE5NzIwNTEtMy4yMDUzIDEuMTk3MjA1MS00LjQyODA4MSAwbC04LjEwMDU4NC03LjkzMTE0NzljLTM0LjEyMTY5Mi0zMy40MDc5ODE3LTg5LjQ0Mzg4Ni0zMy40MDc5ODE3LTEyMy41NjU1Nzg4IDBsLTguNjc1MDU2MiA4LjQ5MzYwNTFjLTEuMjIyNzgxNiAxLjE5NzIwNDEtMy4yMDUzMDEgMS4xOTcyMDQxLTQuNDI4MDgwNiAwbC0yMC4xMzY2OTQ5LTE5LjcxNTUwMzFjLTIuNDQ1NTYxMi0yLjM5NDQwOTItMi40NDU1NjEyLTYuMjc2NTEyMiAwLTguNjcwOTIwNHptMjE4Ljc2Nzc5NjEgNDAuNzczNzQ0OSAxNy45MjE2OTcgMTcuNTQ2ODk3YzIuNDQ1NTQ5IDIuMzk0Mzk2OSAyLjQ0NTU2MyA2LjI3NjQ3NjkuMDAwMDMxIDguNjcwODg5OWwtODAuODEwMTcxIDc5LjEyMTEzNGMtMi40NDU1NDQgMi4zOTQ0MjYtNi40MTA1ODIgMi4zOTQ0NTMtOC44NTYxNi4wMDAwNjItLjAwMDAxLS4wMDAwMS0uMDAwMDIyLS4wMDAwMjItLjAwMDAzMi0uMDAwMDMybC01Ny4zNTQxNDMtNTYuMTU0NTcyYy0uNjExMzktLjU5ODYwMi0xLjYwMjY1LS41OTg2MDItMi4yMTQwNCAwLS4wMDAwMDQuMDAwMDA0LS4wMDAwMDcuMDAwMDA4LS4wMDAwMTEuMDAwMDExbC01Ny4zNTI5MjEyIDU2LjE1NDUzMWMtMi40NDU1MzY4IDIuMzk0NDMyLTYuNDEwNTc1NSAyLjM5NDQ3Mi04Ljg1NjE2MTIuMDAwMDg3LS4wMDAwMTQzLS4wMDAwMTQtLjAwMDAyOTYtLjAwMDAyOC0uMDAwMDQ0OS0uMDAwMDQ0bC04MC44MTI0MTk0My03OS4xMjIxODVjLTIuNDQ1NTYwMjEtMi4zOTQ0MDgtMi40NDU1NjAyMS02LjI3NjUxMTUgMC04LjY3MDkxOTdsMTcuOTIxNzI5NjMtMTcuNTQ2ODY3M2MyLjQ0NTU2MDItMi4zOTQ0MDgyIDYuNDEwNTk4OS0yLjM5NDQwODIgOC44NTYxNjAyIDBsNTcuMzU0OTc3NSA1Ni4xNTUzNTdjLjYxMTM5MDguNTk4NjAyIDEuNjAyNjQ5LjU5ODYwMiAyLjIxNDAzOTggMCAuMDAwMDA5Mi0uMDAwMDA5LjAwMDAxNzQtLjAwMDAxNy4wMDAwMjY1LS4wMDAwMjRsNTcuMzUyMTAzMS01Ni4xNTUzMzNjMi40NDU1MDUtMi4zOTQ0NjMzIDYuNDEwNTQ0LTIuMzk0NTUzMSA4Ljg1NjE2MS0uMDAwMi4wMDAwMzQuMDAwMDMzNi4wMDAwNjguMDAwMDY3My4wMDAxMDEuMDAwMTAxbDU3LjM1NDkwMiA1Ni4xNTU0MzJjLjYxMTM5LjU5ODYwMSAxLjYwMjY1LjU5ODYwMSAyLjIxNDA0IDBsNTcuMzUzOTc1LTU2LjE1NDMyNDljMi40NDU1NjEtMi4zOTQ0MDkyIDYuNDEwNTk5LTIuMzk0NDA5MiA4Ljg1NjE2IDB6IiBmaWxsPSIjM2I5OWZjIi8+PC9zdmc+';

    private _publicKey: PublicKey | null;
    private _connecting: boolean;
    private _options: SignClientTypes.Options;
    private _client: WalletConnectClient | undefined;
    private _session: SessionTypes.Struct | undefined;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' ? WalletReadyState.Unsupported : WalletReadyState.Loadable;
    private _network: WalletAdapterNetwork;

    constructor(config: WalletConnectWalletAdapterConfig) {
        super();

        this._publicKey = null;
        this._connecting = false;
        this._network = config.network || WalletAdapterNetwork.Devnet;
        this._options = config.options;
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
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Loadable) throw new WalletNotReadyError();

            this._connecting = true;

            let client: WalletConnectClient;
            let session: SessionTypes.Struct;
            try {
                client = await WalletConnectClient.init(this._options);

                const pairings = client.pairing.getAll({ active: true });
                // Prototypically, the user should be prompted to either:
                // - Connect to a previously active pairing
                // - Choose a new pairing
                // There doesn't seem to be a WalletConnect-provided UI for this like there exists for the QRCode modal, though,
                // and pushing this into user-land would be way too much
                // If we decide to try and pair automatically, the UI will hang waiting for a pairing that might not complete
                // const lastActivePairing = pairings.length ? pairings[pairings.length - 1].topic : undefined;
                const lastActivePairing = undefined;

                const { uri, approval } = await client.connect(
                    getWalletConnectParams(getChainId(this._network), lastActivePairing)
                );

                if (uri) {
                    QRCodeModal.open(uri, () => {
                        throw new WalletWindowClosedError();
                    });
                }

                session = await approval();
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletConnectionError(error?.message, error);
            }

            if (!session.namespaces.solana.accounts.length) throw new WalletAccountError();

            let publicKey: PublicKey;
            try {
                const { address } = parseAccountId(session.namespaces.solana.accounts[0]);
                publicKey = new PublicKey(address);
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            client.on('session_delete', this._disconnected);

            this._publicKey = publicKey;
            this._client = client;
            this._session = session;

            QRCodeModal.close();

            this.emit('connect', publicKey);
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
            this._publicKey = null;
            this._client = undefined;

            try {
                await client.disconnect({
                    topic: this._session.topic,
                    reason: getSdkError('USER_DISCONNECTED'),
                });
            } catch (error: any) {
                this.emit('error', new WalletDisconnectionError(error?.message, error));
            }

            this._session = undefined;
        }

        this.emit('disconnect');
    }

    private async signTx(transaction: Transaction): Promise<Transaction> {
        try {
            const client = this._client;
            const publicKey = this._publicKey;
            const session = this._session;

            if (!client || !publicKey || !session) throw new WalletNotConnectedError();

            try {
                const { signature } = await client.request({
                    chainId: getChainId(this._network),
                    topic: session.topic,
                    request: { method: WalletConnectRPCMethod.signTransaction, params: { ...transaction } },
                });

                transaction.addSignature(publicKey, base58.decode(signature));
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }

            return transaction;
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        return this.signTx(transaction);
    }

    async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        const signed: Transaction[] = [];
        for (const transaction of transactions) {
            signed.push(await this.signTx(transaction));
        }
        return signed;
    }

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        try {
            const client = this._client;
            const publicKey = this._publicKey;
            const session = this._session;

            if (!client || !publicKey || !session) throw new WalletNotConnectedError();

            try {
                const { signature } = await client.request({
                    // This isn't strictly necessary for Solana, but is a required parameter for this function.
                    chainId: getChainId(this._network),
                    topic: session.topic,
                    request: {
                        method: WalletConnectRPCMethod.signMessage,
                        params: { pubkey: publicKey.toString(), message: base58.encode(message) },
                    },
                });

                return base58.decode(signature);
            } catch (error: any) {
                throw new WalletSignMessageError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    private _disconnected = () => {
        const client = this._client;
        if (client) {
            client.off('session_delete', this._disconnected);

            this._publicKey = null;
            this._client = undefined;
            this._session = undefined;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };
}
