import { BaseSignerWalletAdapter, WalletAccountError, WalletConnectionError, WalletDisconnectedError, WalletDisconnectionError, WalletError, WalletNotConnectedError, WalletNotReadyError, WalletPublicKeyError, WalletReadyState, WalletSignTransactionError, WalletWindowClosedError, } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import WalletConnectClient, { CLIENT_EVENTS } from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';
export var WalletConnectChainID;
(function (WalletConnectChainID) {
    WalletConnectChainID["Mainnet"] = "solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ";
    WalletConnectChainID["Devnet"] = "solana:8E9rvCKLFQia2Y35HXjjpWzj8weVo44K";
})(WalletConnectChainID || (WalletConnectChainID = {}));
export var WalletConnectRPCMethod;
(function (WalletConnectRPCMethod) {
    WalletConnectRPCMethod["SOL_SIGN_TRANSACTION"] = "sol_signTransaction";
})(WalletConnectRPCMethod || (WalletConnectRPCMethod = {}));
export const WalletConnectWalletName = 'WalletConnect';
export class WalletConnectWalletAdapter extends BaseSignerWalletAdapter {
    constructor(config) {
        super();
        this.name = WalletConnectWalletName;
        this.url = 'https://walletconnect.org';
        this.icon = 'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE4NSIgdmlld0JveD0iMCAwIDMwMCAxODUiIHdpZHRoPSIzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTYxLjQzODU0MjkgMzYuMjU2MjYxMmM0OC45MTEyMjQxLTQ3Ljg4ODE2NjMgMTI4LjIxMTk4NzEtNDcuODg4MTY2MyAxNzcuMTIzMjA5MSAwbDUuODg2NTQ1IDUuNzYzNDE3NGMyLjQ0NTU2MSAyLjM5NDQwODEgMi40NDU1NjEgNi4yNzY1MTEyIDAgOC42NzA5MjA0bC0yMC4xMzY2OTUgMTkuNzE1NTAzYy0xLjIyMjc4MSAxLjE5NzIwNTEtMy4yMDUzIDEuMTk3MjA1MS00LjQyODA4MSAwbC04LjEwMDU4NC03LjkzMTE0NzljLTM0LjEyMTY5Mi0zMy40MDc5ODE3LTg5LjQ0Mzg4Ni0zMy40MDc5ODE3LTEyMy41NjU1Nzg4IDBsLTguNjc1MDU2MiA4LjQ5MzYwNTFjLTEuMjIyNzgxNiAxLjE5NzIwNDEtMy4yMDUzMDEgMS4xOTcyMDQxLTQuNDI4MDgwNiAwbC0yMC4xMzY2OTQ5LTE5LjcxNTUwMzFjLTIuNDQ1NTYxMi0yLjM5NDQwOTItMi40NDU1NjEyLTYuMjc2NTEyMiAwLTguNjcwOTIwNHptMjE4Ljc2Nzc5NjEgNDAuNzczNzQ0OSAxNy45MjE2OTcgMTcuNTQ2ODk3YzIuNDQ1NTQ5IDIuMzk0Mzk2OSAyLjQ0NTU2MyA2LjI3NjQ3NjkuMDAwMDMxIDguNjcwODg5OWwtODAuODEwMTcxIDc5LjEyMTEzNGMtMi40NDU1NDQgMi4zOTQ0MjYtNi40MTA1ODIgMi4zOTQ0NTMtOC44NTYxNi4wMDAwNjItLjAwMDAxLS4wMDAwMS0uMDAwMDIyLS4wMDAwMjItLjAwMDAzMi0uMDAwMDMybC01Ny4zNTQxNDMtNTYuMTU0NTcyYy0uNjExMzktLjU5ODYwMi0xLjYwMjY1LS41OTg2MDItMi4yMTQwNCAwLS4wMDAwMDQuMDAwMDA0LS4wMDAwMDcuMDAwMDA4LS4wMDAwMTEuMDAwMDExbC01Ny4zNTI5MjEyIDU2LjE1NDUzMWMtMi40NDU1MzY4IDIuMzk0NDMyLTYuNDEwNTc1NSAyLjM5NDQ3Mi04Ljg1NjE2MTIuMDAwMDg3LS4wMDAwMTQzLS4wMDAwMTQtLjAwMDAyOTYtLjAwMDAyOC0uMDAwMDQ0OS0uMDAwMDQ0bC04MC44MTI0MTk0My03OS4xMjIxODVjLTIuNDQ1NTYwMjEtMi4zOTQ0MDgtMi40NDU1NjAyMS02LjI3NjUxMTUgMC04LjY3MDkxOTdsMTcuOTIxNzI5NjMtMTcuNTQ2ODY3M2MyLjQ0NTU2MDItMi4zOTQ0MDgyIDYuNDEwNTk4OS0yLjM5NDQwODIgOC44NTYxNjAyIDBsNTcuMzU0OTc3NSA1Ni4xNTUzNTdjLjYxMTM5MDguNTk4NjAyIDEuNjAyNjQ5LjU5ODYwMiAyLjIxNDAzOTggMCAuMDAwMDA5Mi0uMDAwMDA5LjAwMDAxNzQtLjAwMDAxNy4wMDAwMjY1LS4wMDAwMjRsNTcuMzUyMTAzMS01Ni4xNTUzMzNjMi40NDU1MDUtMi4zOTQ0NjMzIDYuNDEwNTQ0LTIuMzk0NTUzMSA4Ljg1NjE2MS0uMDAwMi4wMDAwMzQuMDAwMDMzNi4wMDAwNjguMDAwMDY3My4wMDAxMDEuMDAwMTAxbDU3LjM1NDkwMiA1Ni4xNTU0MzJjLjYxMTM5LjU5ODYwMSAxLjYwMjY1LjU5ODYwMSAyLjIxNDA0IDBsNTcuMzUzOTc1LTU2LjE1NDMyNDljMi40NDU1NjEtMi4zOTQ0MDkyIDYuNDEwNTk5LTIuMzk0NDA5MiA4Ljg1NjE2IDB6IiBmaWxsPSIjM2I5OWZjIi8+PC9zdmc+';
        this._readyState = typeof window === 'undefined' ? WalletReadyState.Unsupported : WalletReadyState.Loadable;
        this._disconnected = () => {
            const client = this._client;
            if (client) {
                client.off(CLIENT_EVENTS.session.deleted, this._disconnected);
                this._publicKey = null;
                this._client = undefined;
                this.emit('error', new WalletDisconnectedError());
                this.emit('disconnect');
            }
        };
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
    get publicKey() {
        return this._publicKey;
    }
    get connecting() {
        return this._connecting;
    }
    get readyState() {
        return this._readyState;
    }
    async connect() {
        try {
            if (this.connected || this.connecting)
                return;
            if (this._readyState !== WalletReadyState.Loadable)
                throw new WalletNotReadyError();
            this._connecting = true;
            let client;
            let session;
            try {
                client = await WalletConnectClient.init(this._options);
                // eslint-disable-next-line no-async-promise-executor
                session = await new Promise(async (resolve, reject) => {
                    let session;
                    async function onPairingProposal(proposal) {
                        const { uri } = proposal.signal.params;
                        QRCodeModal.open(uri, () => {
                            cleanup();
                            reject(new WalletWindowClosedError());
                        });
                    }
                    async function onPairingCreated(created) {
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
                    }
                    catch (error) {
                        cleanup();
                        reject(error);
                    }
                });
            }
            catch (error) {
                if (error instanceof WalletError)
                    throw error;
                throw new WalletConnectionError(error === null || error === void 0 ? void 0 : error.message, error);
            }
            if (!session.state.accounts.length)
                throw new WalletAccountError();
            const match = session.state.accounts[0].match(/:([0-9a-zA-Z]+)$/);
            if (!match)
                throw new WalletAccountError();
            const account = match[1];
            let publicKey;
            try {
                publicKey = new PublicKey(account);
            }
            catch (error) {
                throw new WalletPublicKeyError(error === null || error === void 0 ? void 0 : error.message, error);
            }
            client.on(CLIENT_EVENTS.session.deleted, this._disconnected);
            this._publicKey = publicKey;
            this._client = client;
            this.emit('connect', publicKey);
        }
        catch (error) {
            this.emit('error', error);
            throw error;
        }
        finally {
            this._connecting = false;
        }
    }
    async disconnect() {
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
            }
            catch (error) {
                this.emit('error', new WalletDisconnectionError(error === null || error === void 0 ? void 0 : error.message, error));
            }
        }
        this.emit('disconnect');
    }
    async signTransaction(transaction) {
        try {
            const client = this._client;
            const publicKey = this._publicKey;
            if (!client || !publicKey)
                throw new WalletNotConnectedError();
            try {
                const signature = await client.request({
                    topic: '',
                    request: {
                        method: WalletConnectRPCMethod.SOL_SIGN_TRANSACTION,
                        params: transaction,
                    },
                });
                transaction.addSignature(publicKey, signature);
            }
            catch (error) {
                throw new WalletSignTransactionError(error === null || error === void 0 ? void 0 : error.message, error);
            }
            return transaction;
        }
        catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    async signAllTransactions(transactions) {
        try {
            const client = this._client;
            const publicKey = this._publicKey;
            if (!client || !publicKey)
                throw new WalletNotConnectedError();
            try {
                for (const transaction of transactions) {
                    const signature = await client.request({
                        topic: '',
                        request: {
                            method: WalletConnectRPCMethod.SOL_SIGN_TRANSACTION,
                            params: transaction,
                        },
                    });
                    transaction.addSignature(publicKey, signature);
                }
            }
            catch (error) {
                throw new WalletSignTransactionError(error === null || error === void 0 ? void 0 : error.message, error);
            }
            return transactions;
        }
        catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
}
//# sourceMappingURL=adapter.js.map