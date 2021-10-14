import { writable } from 'svelte/store';
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
	select(walletName: WalletName): void;
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	sendTransaction(
		transaction: Transaction,
		connection: Connection,
		options?: SendTransactionOptions
	): Promise<TransactionSignature>;
	signTransaction: SignerWalletAdapterProps['signTransaction'] | undefined;
	signAllTransactions: SignerWalletAdapterProps['signAllTransactions'] | undefined;
	signMessage: MessageSignerWalletAdapterProps['signMessage'] | undefined;
}

interface useWalletNameStoreT {
	walletName: WalletName | undefined;
}

interface useWalletAdapterStoreT {
	adapter: Adapter | null;
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

// Connect the adapter to the wallet.
const connect = async (): Promise<void> => {
	const { connected, connecting, disconnecting, wallet, ready } = get(useWallet);
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
		useWallet.update((storeValues: useWalletStoreT) => ({
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
		useWallet.update((storeValues: useWalletStoreT) => ({
			...storeValues,
			connecting: false
		}));
	}
};

// Disconnect the adapter from the wallet.
const disconnect = async (): Promise<void> => {
	const { disconnecting } = get(useWallet);
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
		useWallet.update((storeValues: useWalletStoreT) => ({
			...storeValues,
			disconnecting: true
		}));
		await adapter.disconnect();
		// localStorage.removeItem(localStorageKey);
	} finally {
		useWallet.update((storeValues: useWalletStoreT) => ({
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
	const { connected } = get(useWallet);
	const { adapter } = get(useWalletAdapter);
	if (!adapter) throw newError(new WalletNotSelectedError());
	if (!connected) throw newError(new WalletNotConnectedError());
	return await adapter.sendTransaction(transaction, connection, options);
};

//export const useWallet
export const useWallet = writable<useWalletStoreT>({
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
	disconnecting: false,

	// Methods
	select,
	connect,
	disconnect,
	sendTransaction,
	signTransaction: undefined,
	signAllTransactions: undefined,
	signMessage: undefined
});

const useWalletName = writable<useWalletNameStoreT>({
	walletName: undefined
});

const useWalletAdapter = writable<useWalletAdapterStoreT>({
	adapter: null
});

let triggerError: onError;
let key: string;

export async function initWallet({
	wallets,
	autoConnect = false,
	localStorageKey = 'walletAdapter',
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

	useWallet.update((storeValues: useWalletStoreT) => ({
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

// Handle the adapter events.
const onReady = () => {
	useWallet.update((storeValues: useWalletStoreT) => ({
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
	const { wallet } = get(useWallet);
	if (!adapter || !wallet) return;
	useWallet.update((storeValues: useWalletStoreT) => ({
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
	const { walletsByName } = get(useWallet);
	const wallet = walletsByName?.[walletName as WalletName] ?? null;
	const adapter = wallet?.adapter() ?? null;

	if (adapter) {
		useWallet.update((storeValues: useWalletStoreT) => ({
			...storeValues,
			wallet
		}));

		useWalletAdapter.update((storeValues: useWalletAdapterStoreT) => ({
			...storeValues,
			adapter
		}));
		useWallet.update((storeValues: useWalletStoreT) => ({
			...storeValues,
			ready: adapter.ready,
			publicKey: adapter.publicKey,
			connected: adapter.connected
		}));
	} else {
		useWallet.update((storeValues: useWalletStoreT) => ({
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
	const { autoConnect, ready, connected, connecting } = get(useWallet);
	const { walletName } = get(useWalletName);
	if (!autoConnect || !adapter || !walletName || !ready || connected || connecting) return;
	try {
		useWallet.update((storeValues: useWalletStoreT) => ({
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
		useWallet.update((storeValues: useWalletStoreT) => ({
			...storeValues,
			connecting: false
		}));
	}
})

// watcher for signature functions
useWalletAdapter.subscribe(({ adapter }: { adapter: Adapter | null }) => {
	const { connected } = get(useWallet);

	// Sign a transaction if the wallet supports it.
	if (!(adapter && 'signTransaction' in adapter)) {
		return;
	}  else {
		useWallet.update((storeValues: useWalletStoreT) => ({
			...storeValues,
			signTransaction: async (transaction: Transaction) => {
				if (!connected) throw newError(new WalletNotConnectedError());
				return await adapter.signTransaction(transaction);
			}
		}));
	}

	// Sign multiple transactions if the wallet supports it
	if (!(adapter && 'signAllTransactions' in adapter)) {
		return;
	} else {
		useWallet.update((storeValues: useWalletStoreT) => ({
			...storeValues,
			signAllTransactions: async (transactions: Transaction[]) => {
				if (!connected) throw newError(new WalletNotConnectedError());
				return await adapter.signAllTransactions(transactions);
			}
		}));
	}

	// Sign an arbitrary message if the wallet supports it.
	if (!(adapter && 'signMessage' in adapter)) {
		return;
	} else {
		useWallet.update((storeValues: useWalletStoreT) => ({
			...storeValues,
			signMessage: async (message: Uint8Array) => {
				if (!connected) throw newError(new WalletNotConnectedError());
				return await adapter.signMessage(message);
			}
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
