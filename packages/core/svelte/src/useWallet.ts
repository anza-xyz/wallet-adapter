import { writable, derived } from 'svelte/store';
import { get } from 'svelte/store';
import type { Connection, PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';
import {
	WalletNotConnectedError,
	WalletNotReadyError,
	WalletError
} from '@solana/wallet-adapter-base';
import type { SendTransactionOptions, SignerWalletAdapterProps, MessageSignerWalletAdapterProps, } from '@solana/wallet-adapter-base';
import type { Wallet, WalletName } from '@solana/wallet-adapter-wallets';
import { useLocalStorage } from './useLocalStorage';
import { WalletNotSelectedError } from './errors';

type Adapter = ReturnType<Wallet['adapter']>;
type WalletDictionary = { [name in WalletName]: Wallet };
type onError = (error: WalletError) => void;

interface useWalletStoreT {
	wallets: Wallet[];
	autoConnect: boolean;
	walletsByName: WalletDictionary;
	wallet: Wallet | null;
	publicKey: PublicKey | null;
	ready: boolean;
	connected: boolean;
	connecting: boolean;
	disconnecting: boolean;
}

interface useWalletNameStoreT {
	walletName: WalletName | undefined;
}

interface useWalletAdapterStoreT {
	adapter: Adapter | null;
}

interface useWalletMethods {
	select(walletName: WalletName): void;
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	sendTransaction(
		transaction: Transaction,
		connection: Connection,
		options?: SendTransactionOptions
	): Promise<TransactionSignature>;
	signTransaction(transaction: Transaction): SignerWalletAdapterProps['signTransaction'] | undefined;
	signAllTransactions(transaction: Transaction): SignerWalletAdapterProps['signAllTransactions'] | undefined;
	signMessage(message: Uint8Array): MessageSignerWalletAdapterProps['signMessage'] | undefined;
}

const useWalletStore = writable<useWalletStoreT>({
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
const useWalletName = writable<useWalletNameStoreT>({
	walletName: undefined
});

// This is not exposed to the client
const useWalletAdapter = writable<useWalletAdapterStoreT>({
	adapter: null
});

let triggerError: onError;
let key: string;

export async function initWallet({
	wallets,
	autoConnect = false,
	localStorageKey,
	onError = (error: WalletError) => console.error(error)
}: {
	wallets: Wallet[];
	autoConnect?: boolean;
	localStorageKey: string;
	onError?: onError;
}): Promise<void> {
	const walletsByName = (): WalletDictionary => {
		return wallets.reduce((walletsByName, wallet) => {
			walletsByName[wallet.name] = wallet;
			return walletsByName;
		}, {} as WalletDictionary);
	};

	triggerError = onError;
	key = localStorageKey;

	const walletName = useLocalStorage(key);

	useWalletStore.update((storeValues: useWalletStoreT) => ({
		...storeValues,
		wallets,
		autoConnect,
		walletsByName: walletsByName()
	}));

	useWalletName.update((storeValues: useWalletNameStoreT) => ({
		...storeValues,
		walletName
	}));
}

const select = async (newWalletName: WalletName): Promise<void> => {
	const { walletName } = get(useWalletName);
	const { adapter } = get(useWalletAdapter);
	if (walletName === newWalletName) return;
	if (adapter) await adapter.disconnect();
	useWalletName.update((storeValues: useWalletNameStoreT) => ({
		...storeValues,
		walletName: newWalletName
	}));
};

// Handle the adapter events.
const onReady = () => {
	useWalletStore.update((storeValues: useWalletStoreT) => ({
		...storeValues,
		ready: true
	}));
};

const newError = (error: WalletError): WalletError => {
	triggerError(error);
	return error;
};

const onConnect = () => {
	const { adapter } = get(useWalletAdapter);
	const { wallet } = get(useWalletStore);
	if (!adapter || !wallet) return;
	useWalletStore.update((storeValues: useWalletStoreT) => ({
		...storeValues,
		wallet,
		ready: adapter.ready,
		publicKey: adapter.publicKey,
		connected: adapter.connected
	}));

	useWalletAdapter.update((storeValues: useWalletAdapterStoreT) => ({
		...storeValues,
		adapter
	}));
};

const onDisconnect = () => {
	useWalletName.update((storeValues: useWalletNameStoreT) => ({
		...storeValues,
		walletName: undefined
	}));
};

// watcher for walletName
useWalletName.subscribe(({walletName}: {walletName: WalletName | undefined }) => {
	if (walletName) {
		useLocalStorage(key, walletName);
	}
	const { walletsByName } = get(useWalletStore);
	const wallet = walletsByName?.[walletName as WalletName] ?? null;
	const adapter = wallet?.adapter() ?? null;

	if (adapter) {
		useWalletStore.update((storeValues: useWalletStoreT) => ({
			...storeValues,
			wallet
		}));

		useWalletAdapter.update((storeValues: useWalletAdapterStoreT) => ({
			...storeValues,
			adapter
		}));
		useWalletStore.update((storeValues: useWalletStoreT) => ({
			...storeValues,
			ready: adapter.ready,
			publicKey: adapter.publicKey,
			connected: adapter.connected
		}));
	} else {
		useWalletStore.update((storeValues: useWalletStoreT) => ({
			...storeValues,
			wallet: null,
			ready: false,
			publicKey: null,
			connected: false
		}));
		useWalletAdapter.update((storeValues: useWalletAdapterStoreT) => ({
			...storeValues,
			adapter: null
		}));
	}
});

// watcher for adapter
useWalletAdapter.subscribe(({ adapter }: { adapter: Adapter | null }) => {
	if (!adapter) return;
	adapter.on('ready', onReady);
	adapter.on('connect', onConnect);
	adapter.on('disconnect', onDisconnect);
	adapter.on('error', triggerError);
})

// watcher for auto-connect
useWalletAdapter.subscribe(async ({ adapter }: { adapter: Adapter | null }) => {
	const { autoConnect, ready, connected, connecting } = get(useWalletStore);
	const { walletName } = get(useWalletName);
	if (!autoConnect || !adapter || !walletName || !ready || connected || connecting) return;
	try {
		useWalletStore.update((storeValues: useWalletStoreT) => ({
			...storeValues,
			connecting: true
		}));
		await adapter.connect();
	} catch (error: unknown) {
		// Clear the selected wallet
		useWalletName.update((storeValues: useWalletNameStoreT) => ({
			...storeValues,
			walletName: undefined
		}));
		// Don't throw error, but onError will still be called
	} finally {
		useWalletStore.update((storeValues: useWalletStoreT) => ({
			...storeValues,
			connecting: false
		}));
	}
})

// This has to be used Svelte component inside onDestroy method
export const destroyAdapter = (): void => {
	const { adapter } = get(useWalletAdapter);
	if (!adapter) return;
	adapter.off('ready', onReady);
	adapter.off('connect', onConnect);
	adapter.off('disconnect', onDisconnect);
	adapter.off('error', triggerError);
};

// Connect the adapter to the wallet.
const connect = async (): Promise<void> => {
	const { connected, connecting, disconnecting, wallet, ready } = get(useWalletStore);
	const { adapter } = get(useWalletAdapter);
	if (connected || connecting || disconnecting) return;
	if (!wallet || !adapter) throw newError(new WalletNotSelectedError());

	if (!ready) {
		useWalletName.update((storeValues: useWalletNameStoreT) => ({
			...storeValues,
			walletName: undefined
		}));
		window.open(wallet.url, '_blank');
		throw newError(new WalletNotReadyError());
	}

	try {
		useWalletStore.update((storeValues: useWalletStoreT) => ({
			...storeValues,
			connecting: true
		}));
		await adapter.connect();
	} catch (error: unknown) {
		useWalletName.update((storeValues: useWalletNameStoreT) => ({
			...storeValues,
			walletName: undefined
		}));
		throw error;
	} finally {
		useWalletStore.update((storeValues: useWalletStoreT) => ({
			...storeValues,
			connecting: false
		}));
	}
};

// Disconnect the adapter from the wallet.
const disconnect = async (): Promise<void> => {
	const { disconnecting } = get(useWalletStore);
	const { adapter } = get(useWalletAdapter);
	if (disconnecting) return;
	if (!adapter) {
		useWalletName.update((storeValues: useWalletNameStoreT) => ({
			...storeValues,
			walletName: undefined
		}));
		return;
	}
	try {
		useWalletStore.update((storeValues: useWalletStoreT) => ({
			...storeValues,
			disconnecting: true
		}));
		await adapter.disconnect();
		// localStorage.removeItem(localStorageKey);
	} finally {
		useWalletStore.update((storeValues: useWalletStoreT) => ({
			...storeValues,
			disconnecting: false
		}));

		useWalletName.update((storeValues: useWalletNameStoreT) => ({
			...storeValues,
			walletName: undefined
		}));
	}
};

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
const signTransaction: SignerWalletAdapterProps['signTransaction'] | undefined = async (transaction: Transaction) => {
	const { connected } = get(useWalletStore);
	const { adapter } = get(useWalletAdapter);
	if (!(adapter && 'signTransaction' in adapter)) return;
	if (!connected) throw newError(new WalletNotConnectedError());
	return await adapter.signTransaction(transaction);
};

// Sign multiple transactions if the wallet supports it
const signAllTransactions: SignerWalletAdapterProps['signAllTransactions'] | undefined = async (
	transactions: Transaction[]
) => {
	const { connected } = get(useWalletStore);
	const { adapter } = get(useWalletAdapter);
	if (!(adapter && 'signAllTransactions' in adapter)) return;
	if (!connected) throw newError(new WalletNotConnectedError());
	return await adapter.signAllTransactions(transactions);
};

// Sign an arbitrary message if the wallet supports it.
const signMessage: MessageSignerWalletAdapterProps['signMessage'] | undefined = async (message: Uint8Array) => {
	const { connected } = get(useWalletStore);
	const { adapter } = get(useWalletAdapter);
	if (!(adapter && 'signMessage' in adapter)) return;
	if (!connected) throw newError(new WalletNotConnectedError());
	return await adapter.signMessage(message);
};

// Wallet exported
export const useWallet = derived(useWalletStore, ($useWalletStore: useWalletStoreT): useWalletStoreT |  useWalletMethods => ({
	...$useWalletStore,
	select,
	connect,
	disconnect,
	sendTransaction,
	signTransaction,
	signAllTransactions,
	signMessage
}));
