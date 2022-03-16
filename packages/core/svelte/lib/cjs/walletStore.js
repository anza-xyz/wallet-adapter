"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = exports.walletStore = void 0;
const wallet_adapter_base_1 = require("@solana/wallet-adapter-base");
const store_1 = require("svelte/store");
const errors_1 = require("./errors");
const localStorage_1 = require("./localStorage");
exports.walletStore = createWalletStore();
function addAdapterEventListeners(adapter) {
    const { onError } = (0, store_1.get)(exports.walletStore);
    adapter.on('connect', onConnect);
    adapter.on('disconnect', onDisconnect);
    adapter.on('error', onError);
}
function autoConnect() {
    return __awaiter(this, void 0, void 0, function* () {
        const { adapter } = (0, store_1.get)(exports.walletStore);
        try {
            exports.walletStore.setConnecting(true);
            yield (adapter === null || adapter === void 0 ? void 0 : adapter.connect());
        }
        catch (error) {
            // Clear the selected wallet
            exports.walletStore.resetWallet();
            // Don't throw error, but onError will still be called
        }
        finally {
            exports.walletStore.setConnecting(false);
        }
    });
}
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        const { connected, connecting, disconnecting, wallet, ready, adapter } = (0, store_1.get)(exports.walletStore);
        if (connected || connecting || disconnecting)
            return;
        if (!wallet || !adapter)
            throw newError(new errors_1.WalletNotSelectedError());
        if (!ready) {
            exports.walletStore.resetWallet();
            if (typeof window !== 'undefined') {
                window.open(wallet.url, '_blank');
            }
            throw newError(new wallet_adapter_base_1.WalletNotReadyError());
        }
        try {
            exports.walletStore.setConnecting(true);
            yield adapter.connect();
        }
        catch (error) {
            exports.walletStore.resetWallet();
            throw error;
        }
        finally {
            exports.walletStore.setConnecting(false);
        }
    });
}
function createWalletStore() {
    const { subscribe, update } = (0, store_1.writable)({
        autoConnect: false,
        wallets: [],
        adapter: null,
        connected: false,
        connecting: false,
        disconnecting: false,
        localStorageKey: 'walletAdapter',
        onError: (error) => console.error(error),
        publicKey: null,
        ready: false,
        wallet: null,
        name: null,
        walletsByName: {},
        connect,
        disconnect,
        select,
        sendTransaction,
        signTransaction: undefined,
        signAllTransactions: undefined,
        signMessage: undefined,
    });
    function updateWalletState(wallet, adapter) {
        updateAdapter(adapter);
        update((store) => (Object.assign(Object.assign({}, store), { name: (wallet === null || wallet === void 0 ? void 0 : wallet.name) || null, wallet, ready: false, publicKey: (adapter === null || adapter === void 0 ? void 0 : adapter.publicKey) || null, connected: (adapter === null || adapter === void 0 ? void 0 : adapter.connected) || false })));
        if (!((wallet === null || wallet === void 0 ? void 0 : wallet.name) && adapter))
            return;
        // Asynchronously update the ready state
        const waiting = wallet.name;
        (function () {
            return __awaiter(this, void 0, void 0, function* () {
                const ready = yield adapter.ready();
                // If the selected wallet hasn't changed while waiting, update the ready state
                if (wallet.name === waiting) {
                    update((store) => (Object.assign(Object.assign({}, store), { ready })));
                    if (shouldAutoConnect()) {
                        autoConnect();
                    }
                }
            });
        })();
    }
    function updateWalletName(name) {
        var _a;
        const { localStorageKey, walletsByName } = (0, store_1.get)(exports.walletStore);
        const wallet = (_a = walletsByName === null || walletsByName === void 0 ? void 0 : walletsByName[name]) !== null && _a !== void 0 ? _a : null;
        const adapter = wallet && wallet.adapter;
        (0, localStorage_1.setLocalStorage)(localStorageKey, name);
        updateWalletState(wallet, adapter);
    }
    function updateAdapter(adapter) {
        removeAdapterEventListeners();
        let signTransaction = undefined;
        let signAllTransactions = undefined;
        let signMessage = undefined;
        if (adapter) {
            // Sign a transaction if the wallet supports it
            if ('signTransaction' in adapter) {
                signTransaction = function (transaction) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const { connected } = (0, store_1.get)(exports.walletStore);
                        if (!connected)
                            throw newError(new wallet_adapter_base_1.WalletNotConnectedError());
                        return yield adapter.signTransaction(transaction);
                    });
                };
            }
            // Sign multiple transactions if the wallet supports it
            if ('signAllTransactions' in adapter) {
                signAllTransactions = function (transactions) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const { connected } = (0, store_1.get)(exports.walletStore);
                        if (!connected)
                            throw newError(new wallet_adapter_base_1.WalletNotConnectedError());
                        return yield adapter.signAllTransactions(transactions);
                    });
                };
            }
            // Sign an arbitrary message if the wallet supports it
            if ('signMessage' in adapter) {
                signMessage = function (message) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const { connected } = (0, store_1.get)(exports.walletStore);
                        if (!connected)
                            throw newError(new wallet_adapter_base_1.WalletNotConnectedError());
                        return yield adapter.signMessage(message);
                    });
                };
            }
            addAdapterEventListeners(adapter);
        }
        update((store) => (Object.assign(Object.assign({}, store), { adapter, signTransaction, signAllTransactions, signMessage })));
    }
    return {
        resetWallet: () => updateWalletName(null),
        setConnecting: (connecting) => update((store) => (Object.assign(Object.assign({}, store), { connecting }))),
        setDisconnecting: (disconnecting) => update((store) => (Object.assign(Object.assign({}, store), { disconnecting }))),
        setReady: (ready) => update((store) => (Object.assign(Object.assign({}, store), { ready }))),
        subscribe,
        updateConfig: (walletConfig) => update((store) => (Object.assign(Object.assign({}, store), walletConfig))),
        updateStatus: (walletStatus) => update((store) => (Object.assign(Object.assign({}, store), walletStatus))),
        updateWallet: (walletName) => updateWalletName(walletName),
    };
}
function disconnect() {
    return __awaiter(this, void 0, void 0, function* () {
        const { disconnecting, adapter } = (0, store_1.get)(exports.walletStore);
        if (disconnecting)
            return;
        if (!adapter)
            return exports.walletStore.resetWallet();
        try {
            exports.walletStore.setDisconnecting(true);
            yield adapter.disconnect();
        }
        finally {
            exports.walletStore.resetWallet();
            exports.walletStore.setDisconnecting(false);
        }
    });
}
function initialize({ wallets, autoConnect = false, localStorageKey = 'walletAdapter', onError = (error) => console.error(error), }) {
    return __awaiter(this, void 0, void 0, function* () {
        const walletsByName = wallets.reduce((walletsByName, wallet) => {
            walletsByName[wallet.name] = wallet;
            return walletsByName;
        }, {});
        exports.walletStore.updateConfig({
            wallets,
            walletsByName,
            autoConnect,
            localStorageKey,
            onError,
        });
        const walletName = (0, localStorage_1.getLocalStorage)(localStorageKey);
        if (walletName) {
            exports.walletStore.updateWallet(walletName);
        }
    });
}
exports.initialize = initialize;
function newError(error) {
    const { onError } = (0, store_1.get)(exports.walletStore);
    onError(error);
    return error;
}
function onConnect() {
    const { adapter, wallet } = (0, store_1.get)(exports.walletStore);
    if (!adapter || !wallet)
        return;
    exports.walletStore.updateStatus({
        publicKey: adapter.publicKey,
        connected: adapter.connected,
    });
}
function onDisconnect() {
    exports.walletStore.resetWallet();
}
function removeAdapterEventListeners() {
    const { adapter, onError } = (0, store_1.get)(exports.walletStore);
    if (!adapter)
        return;
    adapter.off('connect', onConnect);
    adapter.off('disconnect', onDisconnect);
    adapter.off('error', onError);
}
function select(walletName) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, adapter } = (0, store_1.get)(exports.walletStore);
        if (name === walletName)
            return;
        if (adapter)
            yield disconnect();
        exports.walletStore.updateWallet(walletName);
    });
}
function sendTransaction(transaction, connection, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { connected, adapter } = (0, store_1.get)(exports.walletStore);
        if (!connected)
            throw newError(new wallet_adapter_base_1.WalletNotConnectedError());
        if (!adapter)
            throw newError(new errors_1.WalletNotSelectedError());
        return yield adapter.sendTransaction(transaction, connection, options);
    });
}
function shouldAutoConnect() {
    const { adapter, autoConnect, ready, connected, connecting } = (0, store_1.get)(exports.walletStore);
    return !(!autoConnect || !adapter || !ready || connected || connecting);
}
if (typeof window !== 'undefined') {
    // Ensure the adapter listeners are invalidated before refreshing the page.
    window.addEventListener('beforeunload', removeAdapterEventListeners);
}
//# sourceMappingURL=walletStore.js.map