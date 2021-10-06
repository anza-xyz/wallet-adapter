import { ref, Ref, computed, watch, watchEffect } from '@vue/runtime-core';
import { Connection, PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';
import {
    SendTransactionOptions,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletError,
    SignerWalletAdapterProps,
    MessageSignerWalletAdapterProps,
} from '@solana/wallet-adapter-base';
import { Wallet, WalletName } from '@solana/wallet-adapter-wallets';
import { useLocalStorage } from './useLocalStorage';
import { WalletNotSelectedError } from './errors';

type Adapter = ReturnType<Wallet['adapter']>;
type WalletDictionary = { [name in WalletName]: Wallet };

export interface WalletStore {
    // Props.
    wallets: Wallet[];
    autoConnect: boolean;

    // Data.
    wallet: Ref<Wallet | null>;
    adapter: Ref<Adapter | null>;
    publicKey: Ref<PublicKey | null>;
    ready: Ref<boolean>;
    connected: Ref<boolean>;
    connecting: Ref<boolean>;
    disconnecting: Ref<boolean>;

    // Methods.
    select(walletName: WalletName): void;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendTransaction(transaction: Transaction, connection: Connection, options?: SendTransactionOptions): Promise<TransactionSignature>;
    signTransaction: Ref<SignerWalletAdapterProps['signTransaction'] | undefined>;
    signAllTransactions: Ref<SignerWalletAdapterProps['signAllTransactions'] | undefined>;
    signMessage: Ref<MessageSignerWalletAdapterProps['signMessage'] | undefined>;
}

export interface WalletStoreProps {
    wallets: Wallet[];
    autoConnect?: boolean;
    onError?: (error: WalletError) => void;
    localStorageKey?: string;
}

let walletStore: WalletStore = {} as WalletStore;

export const useWallet = (): WalletStore => walletStore;

export const initWallet = ({
    wallets,
    autoConnect = false,
    onError = (error: WalletError) => console.error(error),
    localStorageKey = 'walletName',
}: WalletStoreProps): void => {
    const walletName: Ref<WalletName | null> = useLocalStorage<WalletName>(localStorageKey);
    const wallet = ref<Wallet | null>(null);
    const adapter = ref<Adapter | null>(null);
    const publicKey = ref<PublicKey | null>(null);
    const ready = ref<boolean>(false);
    const connected = ref<boolean>(false);
    const connecting = ref<boolean>(false);
    const disconnecting = ref<boolean>(false);

    // Helper methods to set and reset the main state variables.
    const setState = (state: {
        wallet: Wallet | null;
        adapter: Adapter | null;
        publicKey: PublicKey | null;
        ready: boolean;
        connected: boolean;
    }) => {
        wallet.value = state.wallet;
        adapter.value = state.adapter;
        ready.value = state.ready;
        publicKey.value = state.publicKey;
        connected.value = state.connected;
    }
    const setStateFromAdapter = (wallet: Wallet, adapter: Adapter) => {
        setState({
            wallet,
            adapter,
            ready: adapter.ready,
            publicKey: adapter.publicKey,
            connected: adapter.connected,
        })
    }
    const resetState = () => {
        setState({
            wallet: null,
            adapter: null,
            ready: false,
            publicKey: null,
            connected: false,
        })
    }

    // Create a wallet dictionary keyed by their name.
    const walletsByName = computed<WalletDictionary>(() => {
        return wallets.reduce((walletsByName, wallet) => {
            walletsByName[wallet.name] = wallet;
            return walletsByName;
        }, {} as WalletDictionary);
    });

    // Update the wallet and adapter based on the wallet provider.
    watch(walletName, (): void => {
        const wallet = walletsByName.value?.[walletName.value as WalletName] ?? null;
        const adapter = wallet?.adapter() ?? null;
        if (! adapter) return resetState();
        setStateFromAdapter(wallet, adapter);
    }, { immediate:true });

    // Select a wallet by name.
    const select = async (newWalletName: WalletName): Promise<void> => {
        if (walletName.value === newWalletName) return
        if (adapter.value) await adapter.value.disconnect()
        walletName.value = newWalletName
    };

    // Handle the adapter events.
    const onReady = () => ready.value = true;
    const onDisconnect = () => walletName.value = null;
    const onConnect = () => {
        if (! wallet.value || ! adapter.value) return;
        setStateFromAdapter(wallet.value, adapter.value);
    };
    const invalidateListeners = watchEffect(onInvalidate => {
        if (! adapter.value) return;
        adapter.value.on('ready', onReady);
        adapter.value.on('connect', onConnect);
        adapter.value.on('disconnect', onDisconnect);
        adapter.value.on('error', onError);
        onInvalidate(() => {
            if (! adapter.value) return;
            adapter.value.off('ready', onReady);
            adapter.value.off('connect', onConnect);
            adapter.value.off('disconnect', onDisconnect);
            adapter.value.off('error', onError);
        });
    });
    window.addEventListener('beforeunload', invalidateListeners);

    // Helper method to return an error whilst using the onError callback.
    const newError = (error: WalletError): WalletError => {
        onError(error);
        return error;
    };

    // Connect the adapter to the wallet.
    const connect = async (): Promise<void> => {
        if (connected.value || connecting.value || disconnecting.value) return;
        if (! wallet.value || ! adapter.value) throw newError(new WalletNotSelectedError());

        if (! ready.value) {
            walletName.value = null;
            window.open(wallet.value.url, '_blank');
            throw newError(new WalletNotReadyError());
        }

        try {
            connecting.value = true;
            await adapter.value.connect();
        } catch (error: any) {
            walletName.value = null;
            throw error;
        } finally {
            connecting.value = false;
        }
    };

    // Disconnect the adapter from the wallet.
    const disconnect = async (): Promise<void> => {
        if (disconnecting.value) return;
        if (! adapter.value) {
            walletName.value = null;
            return;
        }

        try {
            disconnecting.value = true;
            await adapter.value.disconnect();
        } finally {
            walletName.value = null;
            disconnecting.value = false;
        }
    };

    // Send a transaction using the provided connection.
    const sendTransaction = async (transaction: Transaction, connection: Connection, options?: SendTransactionOptions) => {
        if (! adapter.value) throw newError(new WalletNotSelectedError());
        if (! connected.value) throw newError(new WalletNotConnectedError());
        return await adapter.value.sendTransaction(transaction, connection, options);
    };

    // Sign a transaction if the wallet supports it.
    const signTransaction = computed(() => {
        if (! (adapter.value && 'signTransaction' in adapter.value)) return undefined;
        return async (transaction: Transaction) => {
            if (! connected.value) throw newError(new WalletNotConnectedError());
            // @ts-ignore
            return await adapter.value.signTransaction(transaction);
        }
    });

    // Sign multiple transactions if the wallet supports it
    const signAllTransactions = computed(() => {
        if (! (adapter.value && 'signAllTransactions' in adapter.value)) return undefined;
        return async (transactions: Transaction[]) => {
            if (! connected.value) throw newError(new WalletNotConnectedError());
            // @ts-ignore
            return await adapter.value.signAllTransactions(transactions);
        }
    });

    // Sign an arbitrary message if the wallet supports it.
    const signMessage = computed(() => {
        if (! (adapter.value && 'signMessage' in adapter.value)) return undefined;
        return async (message: Uint8Array) => {
            if (! connected.value) throw newError(new WalletNotConnectedError());
            // @ts-ignore
            return await adapter.value.signMessage(message);
        }
    });

    // If autoConnect is enabled, try to connect when the adapter changes and is ready.
    watchEffect(async (): Promise<void> => {
        if (! autoConnect || ! adapter.value || ! ready.value || connected.value || connecting.value) return;
        try {
            connecting.value = true;
            await adapter.value.connect();
        } catch (error: any) {
            // Clear the selected wallet
            walletName.value = null;
            // Don't throw error, but onError will still be called
        } finally {
            connecting.value = false;
        }
    });

    walletStore = {
        // Props.
        wallets,
        autoConnect,

        // Data.
        wallet,
        adapter,
        publicKey,
        ready,
        connected,
        connecting,
        disconnecting,

        // Methods.
        select,
        connect,
        disconnect,
        sendTransaction,
        signTransaction,
        signAllTransactions,
        signMessage,
    };
};
