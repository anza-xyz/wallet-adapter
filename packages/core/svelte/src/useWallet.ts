import { writable, derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { get } from 'svelte/store';
import type { Connection, PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';
import {
	WalletNotConnectedError,
	WalletNotReadyError,
	WalletError
} from '@solana/wallet-adapter-base';
import type { SendTransactionOptions } from '@solana/wallet-adapter-base';
import type { Wallet, WalletName } from '@solana/wallet-adapter-wallets';
import { useLocalStorage } from './useLocalStorage';
import { WalletNotSelectedError } from './errors';

type Adapter = ReturnType<Wallet['adapter']>;
type WalletDictionary = { [name in WalletName]: Wallet };
type Stores = Readable<unknown> | [Readable<unknown>, ...Array<Readable<unknown>>] | Array<Readable<unknown>>;

export interface useWalletStoreT {
	wallets: Wallet[];
	autoConnect: boolean;
	walletsByName: WalletDictionary | null;
	wallet: Wallet | null;
	publicKey: PublicKey | null;
	ready: boolean;
	connected: boolean;
	connecting: boolean;
	disconnecting: boolean;
}

export interface useWalletNameStoreT {
    walletName: WalletName | null;
}

export interface useWalletAdapterStoreT {
    adapter: Adapter | null;
}

export interface useWalletMethods {
    select(walletName: WalletName): void;
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	sendTransaction(
		transaction: Transaction,
		connection: Connection,
		options?: SendTransactionOptions
	): Promise<TransactionSignature>;
	signTransaction(): Promise<Transaction>;
	signAllTransactions(): Promise<Transaction[]>;
	signMessage(): Promise<Uint8Array>;
}

export const useWalletStore = writable<useWalletStoreT>({
	//Props
	wallets: [],
	autoConnect: false,

	// Data
	walletsByName: null,
	wallet: null,
	publicKey: null,
	ready: false,
	connected: false,
	connecting: false,
	disconnecting: false
});

// This is not exposed to the client
export const useWalletName = writable<useWalletNameStoreT>({
	walletName: undefined,
});

// This is not exposed to the client
export const useWalletAdapter = writable<useWalletAdapterStoreT>({
	adapter: null,
});

export async function initWallet({
	wallets,
	autoConnect = false,
	localStorageKey,
}: {
	wallets: Wallet[];
	autoConnect?: boolean;
	localStorageKey: string;
}): Promise<void> {
	const walletsByName = (): WalletDictionary => {
		return wallets.reduce((walletsByName, wallet) => {
			walletsByName[wallet.name] = wallet;
			return walletsByName;
		}, {} as WalletDictionary);
	};

	const walletName = useLocalStorage(localStorageKey);

	useWalletStore.update((storeValues) => ({
        ...storeValues,
		wallets,
		autoConnect,
		walletsByName: walletsByName()
	}));

    useWalletName.update((storeValues) => ({
        ...storeValues,
		walletName,
	}));
}

const select = async (newWalletName: WalletName): Promise<void> => {
	const { walletName } = get(useWalletName);
    const { adapter } = get(useWalletAdapter);
	if (walletName === newWalletName) return;
	if (adapter) await adapter.disconnect();
	useWalletName.update((storeValues) => ({
		...storeValues,
		walletName: newWalletName
	}));
};

// Handle the adapter events.
const onReady = () => {
	useWalletStore.update((storeValues) => ({
		...storeValues,
		ready: true
	}));
};

const onError = (error: WalletError) => console.error(error);

const newError = (error: WalletError): WalletError => {
	onError(error);
	return error;
};

const onConnect = () => {
	const { adapter } = get(useWalletAdapter);
	const { wallet } = get(useWalletStore);
	if (!adapter || !wallet) return;
	useWalletStore.update((storeValues) => ({
		...storeValues,
		wallet,
		adapter,
		ready: adapter.ready,
		publicKey: adapter.publicKey,
		connected: adapter.connected
	}));
};

const onDisconnect = () => {
	useWalletName.update((storeValues) => ({
		...storeValues,
		walletName: null,
	}));
}

// Watcher has to be used in Svelte component as reactivity function
export const watchWalletName = (walletName: WalletName | null, localStorageKey: string): void => {
    if(walletName){
        useLocalStorage(localStorageKey, walletName);
    }
	const { walletsByName } = get(useWalletStore);
	const wallet = walletsByName?.[walletName as WalletName] ?? null;
	const adapter = wallet?.adapter() ?? null;

	if (adapter) {
		useWalletStore.update((storeValues) => ({
			...storeValues,
			wallet,
		}));

		useWalletAdapter.update((storeValues) => ({
			...storeValues,
			adapter
		}));
		useWalletStore.update((storeValues) => ({
			...storeValues,
			ready: adapter.ready,
			publicKey: adapter.publicKey,
			connected: adapter.connected
		}));
	} else {
		useWalletStore.update((storeValues) => ({
			...storeValues,
			wallet: null,
			ready: false,
			publicKey: null,
			connected: false
		}));
		useWalletAdapter.update((storeValues) => ({
			...storeValues,
			adapter: null,
		}));
	}
};

// Watcher has to be used in Svelte component as reactivity function
export const watchAdapter = (adapter: Adapter | null): void => {
	if (!adapter) return;
	adapter.on('ready', onReady);
	adapter.on('connect', onConnect);
	adapter.on('disconnect', onDisconnect);
	adapter.on('error', onError);
};

// Watcher has to be used in Svelte component inside onDestroy
export const destroyAdapter = (adapter: Adapter | null): void => {
	if (!adapter) return;
	adapter.off('ready', onReady);
	adapter.off('connect', onConnect);
	adapter.off('disconnect', onDisconnect);
	adapter.off('error', onError);
};

// Connect the adapter to the wallet.
const connect = async (): Promise<void> => {
	const { connected, connecting, disconnecting, wallet, ready } = get(useWalletStore);
    const { adapter } = get(useWalletAdapter);
	if (connected || connecting || disconnecting) return;
	if (!wallet || !adapter) throw newError(new WalletNotSelectedError());

	if (!ready) {
		useWalletName.update((storeValues) => ({
			...storeValues,
			walletName: null
		}));
		window.open(wallet.url, '_blank');
		throw newError(new WalletNotReadyError());
	}

	try {
		useWalletStore.update((storeValues) => ({
			...storeValues,
			connecting: true
		}));
		await adapter.connect();
	} catch (error: unknown) {
		useWalletName.update((storeValues) => ({
			...storeValues,
			walletName: null
		}));
		throw error;
	} finally {
		useWalletStore.update((storeValues) => ({
			...storeValues,
			connecting: false
		}));
	}
};

// Disconnect the adapter from the wallet.
const disconnect = async (localStorageKey: string): Promise<void> => {
	const { disconnecting } = get(useWalletStore);
    const { adapter } = get(useWalletAdapter);
	if (disconnecting) return;
	if (!adapter) {
		useWalletName.update((storeValues) => ({
			...storeValues,
			walletName: null
		}));
		return;
	}
	try {
		useWalletStore.update((storeValues) => ({
			...storeValues,
			disconnecting: true
		}));
		await adapter.disconnect();
		localStorage.removeItem(localStorageKey);
	} finally {
		useWalletStore.update((storeValues) => ({
			...storeValues,
			disconnecting: false
		}));

        useWalletName.update((storeValues) => ({
			...storeValues,
			walletName: null,
		}));
	}
};

// If autoConnect is enabled, try to connect when the adapter changes and is ready.
export async function autoConnectWallet({adapter, walletName}: {adapter: Adapter | null, walletName: WalletName | null}): Promise<void> {
    const { autoConnect, ready, connected, connecting} = get(useWalletStore);
	if( autoConnect && walletName && adapter && ready && !connected && !connecting ) {
		try {
			useWalletStore.update((storeValues) => ({
				...storeValues,
				connecting: true,
			}));
            await adapter.connect();
        } catch (error: unknown) {
            // Clear the selected wallet
            useWalletName.update((storeValues) => ({
				...storeValues,
				walletName: null,
			}));
            // Don't throw error, but onError will still be called
        } finally {
            useWalletStore.update((storeValues) => ({
				...storeValues,
				connecting: false,
			}));
        }
	} else {
        return;
    }
}


// Send a transaction using the provided connection.
const sendTransaction = async (
	transaction: Transaction,
	connection: Connection,
	options?: SendTransactionOptions
) => {
	const { connected } = get(useWalletStore);
	const { adapter } = get(useWalletAdapter);
	if (!adapter) throw newError(new WalletNotSelectedError());
	if (!connected) throw newError(new WalletNotConnectedError());
	return await adapter.sendTransaction(transaction, connection, options);
};

// Sign a transaction if the wallet supports it.
const signTransaction = async () => {
	const { connected } = get(useWalletStore);
	const { adapter } = get(useWalletAdapter);
	if (! (adapter && 'signTransaction' in adapter)) return undefined;
	return async (transaction: Transaction) => {
		if (! connected) throw newError(new WalletNotConnectedError());
		return await adapter.signTransaction(transaction);
	}
};

// Sign multiple transactions if the wallet supports it
const signAllTransactions = async () => {
	const { connected } = get(useWalletStore);
	const { adapter } = get(useWalletAdapter);
	if (! (adapter && 'signAllTransactions' in adapter)) return undefined;
	return async (transactions: Transaction[]) => {
		if (! connected) throw newError(new WalletNotConnectedError());
		return await adapter.signAllTransactions(transactions);
	}
};

// Sign an arbitrary message if the wallet supports it.
const signMessage = async () => {
	const { connected } = get(useWalletStore);
	const { adapter } = get(useWalletAdapter);
	if (! (adapter && 'signMessage' in adapter)) return undefined;
	return async (message: Uint8Array) => {
		if (! connected) throw newError(new WalletNotConnectedError());
		return await adapter.signMessage(message);
	}
};

// Wallet exported
export const useWallet = derived<Stores, useWalletStoreT | useWalletMethods>(useWalletStore, ($useWalletStore: useWalletStoreT) => ({
	...$useWalletStore,
	select,
	connect,
	disconnect,
	sendTransaction,
	signTransaction,
	signAllTransactions,
	signMessage
}));
