"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletConnectWalletAdapter = exports.WalletConnectWalletName = exports.WalletConnectRPCMethod = exports.WalletConnectChainID = void 0;
const wallet_adapter_base_1 = require("@solana/wallet-adapter-base");
const web3_js_1 = require("@solana/web3.js");
const client_1 = __importStar(require("@walletconnect/client"));
const qrcode_modal_1 = __importDefault(require("@walletconnect/qrcode-modal"));
const solana_wallet_1 = require("solana-wallet");
const bs58_1 = __importDefault(require("bs58"));
const utils_1 = require("@walletconnect/utils");
var WalletConnectChainID;
(function (WalletConnectChainID) {
    WalletConnectChainID["Mainnet"] = "solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ";
    WalletConnectChainID["Devnet"] = "solana:8E9rvCKLFQia2Y35HXjjpWzj8weVo44K";
})(WalletConnectChainID = exports.WalletConnectChainID || (exports.WalletConnectChainID = {}));
var WalletConnectRPCMethod;
(function (WalletConnectRPCMethod) {
    WalletConnectRPCMethod["signTransaction"] = "solana_signTransaction";
    WalletConnectRPCMethod["signMessage"] = "solana_signMessage";
})(WalletConnectRPCMethod = exports.WalletConnectRPCMethod || (exports.WalletConnectRPCMethod = {}));
exports.WalletConnectWalletName = 'WalletConnect';
class WalletConnectWalletAdapter extends wallet_adapter_base_1.BaseSignerWalletAdapter {
    constructor(config) {
        super();
        this.name = exports.WalletConnectWalletName;
        this.url = 'https://walletconnect.org';
        this.icon = 'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE4NSIgdmlld0JveD0iMCAwIDMwMCAxODUiIHdpZHRoPSIzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTYxLjQzODU0MjkgMzYuMjU2MjYxMmM0OC45MTEyMjQxLTQ3Ljg4ODE2NjMgMTI4LjIxMTk4NzEtNDcuODg4MTY2MyAxNzcuMTIzMjA5MSAwbDUuODg2NTQ1IDUuNzYzNDE3NGMyLjQ0NTU2MSAyLjM5NDQwODEgMi40NDU1NjEgNi4yNzY1MTEyIDAgOC42NzA5MjA0bC0yMC4xMzY2OTUgMTkuNzE1NTAzYy0xLjIyMjc4MSAxLjE5NzIwNTEtMy4yMDUzIDEuMTk3MjA1MS00LjQyODA4MSAwbC04LjEwMDU4NC03LjkzMTE0NzljLTM0LjEyMTY5Mi0zMy40MDc5ODE3LTg5LjQ0Mzg4Ni0zMy40MDc5ODE3LTEyMy41NjU1Nzg4IDBsLTguNjc1MDU2MiA4LjQ5MzYwNTFjLTEuMjIyNzgxNiAxLjE5NzIwNDEtMy4yMDUzMDEgMS4xOTcyMDQxLTQuNDI4MDgwNiAwbC0yMC4xMzY2OTQ5LTE5LjcxNTUwMzFjLTIuNDQ1NTYxMi0yLjM5NDQwOTItMi40NDU1NjEyLTYuMjc2NTEyMiAwLTguNjcwOTIwNHptMjE4Ljc2Nzc5NjEgNDAuNzczNzQ0OSAxNy45MjE2OTcgMTcuNTQ2ODk3YzIuNDQ1NTQ5IDIuMzk0Mzk2OSAyLjQ0NTU2MyA2LjI3NjQ3NjkuMDAwMDMxIDguNjcwODg5OWwtODAuODEwMTcxIDc5LjEyMTEzNGMtMi40NDU1NDQgMi4zOTQ0MjYtNi40MTA1ODIgMi4zOTQ0NTMtOC44NTYxNi4wMDAwNjItLjAwMDAxLS4wMDAwMS0uMDAwMDIyLS4wMDAwMjItLjAwMDAzMi0uMDAwMDMybC01Ny4zNTQxNDMtNTYuMTU0NTcyYy0uNjExMzktLjU5ODYwMi0xLjYwMjY1LS41OTg2MDItMi4yMTQwNCAwLS4wMDAwMDQuMDAwMDA0LS4wMDAwMDcuMDAwMDA4LS4wMDAwMTEuMDAwMDExbC01Ny4zNTI5MjEyIDU2LjE1NDUzMWMtMi40NDU1MzY4IDIuMzk0NDMyLTYuNDEwNTc1NSAyLjM5NDQ3Mi04Ljg1NjE2MTIuMDAwMDg3LS4wMDAwMTQzLS4wMDAwMTQtLjAwMDAyOTYtLjAwMDAyOC0uMDAwMDQ0OS0uMDAwMDQ0bC04MC44MTI0MTk0My03OS4xMjIxODVjLTIuNDQ1NTYwMjEtMi4zOTQ0MDgtMi40NDU1NjAyMS02LjI3NjUxMTUgMC04LjY3MDkxOTdsMTcuOTIxNzI5NjMtMTcuNTQ2ODY3M2MyLjQ0NTU2MDItMi4zOTQ0MDgyIDYuNDEwNTk4OS0yLjM5NDQwODIgOC44NTYxNjAyIDBsNTcuMzU0OTc3NSA1Ni4xNTUzNTdjLjYxMTM5MDguNTk4NjAyIDEuNjAyNjQ5LjU5ODYwMiAyLjIxNDAzOTggMCAuMDAwMDA5Mi0uMDAwMDA5LjAwMDAxNzQtLjAwMDAxNy4wMDAwMjY1LS4wMDAwMjRsNTcuMzUyMTAzMS01Ni4xNTUzMzNjMi40NDU1MDUtMi4zOTQ0NjMzIDYuNDEwNTQ0LTIuMzk0NTUzMSA4Ljg1NjE2MS0uMDAwMi4wMDAwMzQuMDAwMDMzNi4wMDAwNjguMDAwMDY3My4wMDAxMDEuMDAwMTAxbDU3LjM1NDkwMiA1Ni4xNTU0MzJjLjYxMTM5LjU5ODYwMSAxLjYwMjY1LjU5ODYwMSAyLjIxNDA0IDBsNTcuMzUzOTc1LTU2LjE1NDMyNDljMi40NDU1NjEtMi4zOTQ0MDkyIDYuNDEwNTk5LTIuMzk0NDA5MiA4Ljg1NjE2IDB6IiBmaWxsPSIjM2I5OWZjIi8+PC9zdmc+';
        this._readyState = typeof window === 'undefined' ? wallet_adapter_base_1.WalletReadyState.Unsupported : wallet_adapter_base_1.WalletReadyState.Loadable;
        this._disconnected = () => {
            const client = this._client;
            if (client) {
                client.off(client_1.CLIENT_EVENTS.session.deleted, this._disconnected);
                this._publicKey = null;
                this._client = undefined;
                this._session = undefined;
                this.emit('error', new wallet_adapter_base_1.WalletDisconnectedError());
                this.emit('disconnect');
            }
        };
        this._publicKey = null;
        this._connecting = false;
        this._options = config.options;
        this._params = config.params || {
            permissions: {
                blockchain: { chains: [WalletConnectChainID.Mainnet, WalletConnectChainID.Devnet] },
                jsonrpc: { methods: [WalletConnectRPCMethod.signTransaction, WalletConnectRPCMethod.signMessage] },
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
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.connected || this.connecting)
                    return;
                if (this._readyState !== wallet_adapter_base_1.WalletReadyState.Loadable)
                    throw new wallet_adapter_base_1.WalletNotReadyError();
                this._connecting = true;
                let client;
                let session;
                try {
                    client = yield client_1.default.init(this._options);
                    // eslint-disable-next-line no-async-promise-executor
                    session = yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                        if (client.session.topics.length) {
                            const _session = yield client.session.get(client.session.topics[0]);
                            if (_session) {
                                resolve(_session);
                                return;
                            }
                        }
                        function onPairingProposal(proposal) {
                            return __awaiter(this, void 0, void 0, function* () {
                                const { uri } = proposal.signal.params;
                                qrcode_modal_1.default.open(uri, () => {
                                    cleanup();
                                    reject(new wallet_adapter_base_1.WalletWindowClosedError());
                                });
                            });
                        }
                        function onSessionProposal(proposal) {
                            return __awaiter(this, void 0, void 0, function* () {
                                console.log('onSessionProposal', proposal);
                            });
                        }
                        function onSessionUpdated(updated) {
                            return __awaiter(this, void 0, void 0, function* () {
                                console.log('onSessionUpdated', updated);
                                resolve(updated);
                            });
                        }
                        function cleanup() {
                            client.off(client_1.CLIENT_EVENTS.pairing.proposal, onPairingProposal);
                            client.off(client_1.CLIENT_EVENTS.session.proposal, onSessionProposal);
                            client.off(client_1.CLIENT_EVENTS.session.updated, onSessionUpdated);
                        }
                        try {
                            client.on(client_1.CLIENT_EVENTS.pairing.proposal, onPairingProposal);
                            client.on(client_1.CLIENT_EVENTS.session.proposal, onSessionProposal);
                            client.on(client_1.CLIENT_EVENTS.session.updated, onSessionUpdated);
                            const s = yield client.connect(this._params);
                            resolve(s);
                        }
                        catch (error) {
                            cleanup();
                            reject(error);
                        }
                    }));
                }
                catch (error) {
                    if (error instanceof wallet_adapter_base_1.WalletError)
                        throw error;
                    throw new wallet_adapter_base_1.WalletConnectionError(error === null || error === void 0 ? void 0 : error.message, error);
                }
                if (!session.state.accounts.length)
                    throw new wallet_adapter_base_1.WalletAccountError();
                const match = session.state.accounts[0].match(/:([0-9a-zA-Z]+)$/);
                if (!match)
                    throw new wallet_adapter_base_1.WalletAccountError();
                const account = match[1];
                let publicKey;
                try {
                    publicKey = new web3_js_1.PublicKey(account);
                }
                catch (error) {
                    throw new wallet_adapter_base_1.WalletPublicKeyError(error === null || error === void 0 ? void 0 : error.message, error);
                }
                client.on(client_1.CLIENT_EVENTS.session.deleted, this._disconnected);
                this._publicKey = publicKey;
                this._client = client;
                this._session = session;
                qrcode_modal_1.default.close();
                this.emit('connect', publicKey);
            }
            catch (error) {
                this.emit('error', error);
                throw error;
            }
            finally {
                this._connecting = false;
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this._client;
            if (client) {
                this._publicKey = null;
                this._client = undefined;
                try {
                    yield client.disconnect({
                        topic: this._session.topic,
                        reason: utils_1.ERROR.USER_DISCONNECTED.format(),
                    });
                }
                catch (error) {
                    this.emit('error', new wallet_adapter_base_1.WalletDisconnectionError(error === null || error === void 0 ? void 0 : error.message, error));
                }
                this._session = undefined;
            }
            this.emit('disconnect');
        });
    }
    signTx(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = this._client;
                const publicKey = this._publicKey;
                const session = this._session;
                if (!client || !publicKey || !session)
                    throw new wallet_adapter_base_1.WalletNotConnectedError();
                try {
                    const { signature } = yield client.request({
                        topic: session.topic,
                        request: {
                            method: WalletConnectRPCMethod.signTransaction,
                            params: (0, solana_wallet_1.serialiseTransaction)(transaction),
                        },
                    });
                    transaction.addSignature(publicKey, bs58_1.default.decode(signature));
                }
                catch (error) {
                    throw new wallet_adapter_base_1.WalletSignTransactionError(error === null || error === void 0 ? void 0 : error.message, error);
                }
                return transaction;
            }
            catch (error) {
                this.emit('error', error);
                throw error;
            }
        });
    }
    signTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.signTx(transaction);
        });
    }
    signAllTransactions(transactions) {
        return __awaiter(this, void 0, void 0, function* () {
            const signed = [];
            for (const transaction of transactions) {
                signed.push(yield this.signTx(transaction));
            }
            return signed;
        });
    }
    signMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = this._client;
                const publicKey = this._publicKey;
                const session = this._session;
                if (!client || !publicKey || !session)
                    throw new wallet_adapter_base_1.WalletNotConnectedError();
                try {
                    const { signature } = yield client.request({
                        topic: session.topic,
                        request: {
                            method: WalletConnectRPCMethod.signMessage,
                            params: {
                                pubkey: publicKey.toString(),
                                message: bs58_1.default.encode(message),
                            },
                        },
                    });
                    return bs58_1.default.decode(signature);
                }
                catch (error) {
                    throw new wallet_adapter_base_1.WalletSignTransactionError(error === null || error === void 0 ? void 0 : error.message, error);
                }
            }
            catch (error) {
                this.emit('error', error);
                throw error;
            }
        });
    }
}
exports.WalletConnectWalletAdapter = WalletConnectWalletAdapter;
//# sourceMappingURL=adapter.js.map