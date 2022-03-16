import { WalletNotConnectedError, WalletNotReadyError } from '@solana/wallet-adapter-base';
import { get, writable } from 'svelte/store';
import { WalletNotSelectedError } from './errors.mjs';
import { getLocalStorage, setLocalStorage } from './localStorage.mjs';
export const walletStore = createWalletStore();
function addAdapterEventListeners(adapter) {
    const { onError } = get(walletStore);
    adapter.on('connect', onConnect);
    adapter.on('disconnect', onDisconnect);
    adapter.on('error', onError);
}
async function autoConnect() {
    const { adapter } = get(walletStore);
    try {
        walletStore.setConnecting(true);
        await (adapter === null || adapter === void 0 ? void 0 : adapter.connect());
    }
    catch (error) {
        // Clear the selected wallet
        walletStore.resetWallet();
        // Don't throw error, but onError will still be called
    }
    finally {
        walletStore.setConnecting(false);
    }
}
async function connect() {
    const { connected, connecting, disconnecting, wallet, ready, adapter } = get(walletStore);
    if (connected || connecting || disconnecting)
        return;
    if (!wallet || !adapter)
        throw newError(new WalletNotSelectedError());
    if (!ready) {
        walletStore.resetWallet();
        if (typeof window !== 'undefined') {
            window.open(wallet.url, '_blank');
        }
        throw newError(new WalletNotReadyError());
    }
    try {
        walletStore.setConnecting(true);
        await adapter.connect();
    }
    catch (error) {
        walletStore.resetWallet();
        throw error;
    }
    finally {
        walletStore.setConnecting(false);
    }
}
function createWalletStore() {
    const { subscribe, update } = writable({
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
        update((store) => ({
            ...store,
            name: (wallet === null || wallet === void 0 ? void 0 : wallet.name) || null,
            wallet,
            ready: false,
            publicKey: (adapter === null || adapter === void 0 ? void 0 : adapter.publicKey) || null,
            connected: (adapter === null || adapter === void 0 ? void 0 : adapter.connected) || false,
        }));
        if (!((wallet === null || wallet === void 0 ? void 0 : wallet.name) && adapter))
            return;
        // Asynchronously update the ready state
        const waiting = wallet.name;
        (async function () {
            const ready = await adapter.ready();
            // If the selected wallet hasn't changed while waiting, update the ready state
            if (wallet.name === waiting) {
                update((store) => ({
                    ...store,
                    ready,
                }));
                if (shouldAutoConnect()) {
                    autoConnect();
                }
            }
        })();
    }
    function updateWalletName(name) {
        var _a;
        const { localStorageKey, walletsByName } = get(walletStore);
        const wallet = (_a = walletsByName === null || walletsByName === void 0 ? void 0 : walletsByName[name]) !== null && _a !== void 0 ? _a : null;
        const adapter = wallet && wallet.adapter;
        setLocalStorage(localStorageKey, name);
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
                signTransaction = async function (transaction) {
                    const { connected } = get(walletStore);
                    if (!connected)
                        throw newError(new WalletNotConnectedError());
                    return await adapter.signTransaction(transaction);
                };
            }
            // Sign multiple transactions if the wallet supports it
            if ('signAllTransactions' in adapter) {
                signAllTransactions = async function (transactions) {
                    const { connected } = get(walletStore);
                    if (!connected)
                        throw newError(new WalletNotConnectedError());
                    return await adapter.signAllTransactions(transactions);
                };
            }
            // Sign an arbitrary message if the wallet supports it
            if ('signMessage' in adapter) {
                signMessage = async function (message) {
                    const { connected } = get(walletStore);
                    if (!connected)
                        throw newError(new WalletNotConnectedError());
                    return await adapter.signMessage(message);
                };
            }
            addAdapterEventListeners(adapter);
        }
        update((store) => ({ ...store, adapter, signTransaction, signAllTransactions, signMessage }));
    }
    return {
        resetWallet: () => updateWalletName(null),
        setConnecting: (connecting) => update((store) => ({ ...store, connecting })),
        setDisconnecting: (disconnecting) => update((store) => ({ ...store, disconnecting })),
        setReady: (ready) => update((store) => ({ ...store, ready })),
        subscribe,
        updateConfig: (walletConfig) => update((store) => ({
            ...store,
            ...walletConfig,
        })),
        updateStatus: (walletStatus) => update((store) => ({ ...store, ...walletStatus })),
        updateWallet: (walletName) => updateWalletName(walletName),
    };
}
async function disconnect() {
    const { disconnecting, adapter } = get(walletStore);
    if (disconnecting)
        return;
    if (!adapter)
        return walletStore.resetWallet();
    try {
        walletStore.setDisconnecting(true);
        await adapter.disconnect();
    }
    finally {
        walletStore.resetWallet();
        walletStore.setDisconnecting(false);
    }
}
export async function initialize({ wallets, autoConnect = false, localStorageKey = 'walletAdapter', onError = (error) => console.error(error), }) {
    const walletsByName = wallets.reduce((walletsByName, wallet) => {
        walletsByName[wallet.name] = wallet;
        return walletsByName;
    }, {});
    walletStore.updateConfig({
        wallets,
        walletsByName,
        autoConnect,
        localStorageKey,
        onError,
    });
    const walletName = getLocalStorage(localStorageKey);
    if (walletName) {
        walletStore.updateWallet(walletName);
    }
}
function newError(error) {
    const { onError } = get(walletStore);
    onError(error);
    return error;
}
function onConnect() {
    const { adapter, wallet } = get(walletStore);
    if (!adapter || !wallet)
        return;
    walletStore.updateStatus({
        publicKey: adapter.publicKey,
        connected: adapter.connected,
    });
}
function onDisconnect() {
    walletStore.resetWallet();
}
function removeAdapterEventListeners() {
    const { adapter, onError } = get(walletStore);
    if (!adapter)
        return;
    adapter.off('connect', onConnect);
    adapter.off('disconnect', onDisconnect);
    adapter.off('error', onError);
}
async function select(walletName) {
    const { name, adapter } = get(walletStore);
    if (name === walletName)
        return;
    if (adapter)
        await disconnect();
    walletStore.updateWallet(walletName);
}
async function sendTransaction(transaction, connection, options) {
    const { connected, adapter } = get(walletStore);
    if (!connected)
        throw newError(new WalletNotConnectedError());
    if (!adapter)
        throw newError(new WalletNotSelectedError());
    return await adapter.sendTransaction(transaction, connection, options);
}
function shouldAutoConnect() {
    const { adapter, autoConnect, ready, connected, connecting } = get(walletStore);
    return !(!autoConnect || !adapter || !ready || connected || connecting);
}
if (typeof window !== 'undefined') {
    // Ensure the adapter listeners are invalidated before refreshing the page.
    window.addEventListener('beforeunload', removeAdapterEventListeners);
}
//# sourceMappingURL=walletStore.js.map