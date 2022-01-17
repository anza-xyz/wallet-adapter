import {
    SendTransactionOptions,
    Adapter,
    WalletError,
    WalletName,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletReadyState,
    SignerWalletAdapter,
    MessageSignerWalletAdapter
} from '@solana/wallet-adapter-base';
import { Connection, PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';
import { computed, inject, InjectionKey, provide, Ref, ref, watch, watchEffect } from 'vue';
import { WalletNotSelectedError } from './errors';
import { useLocalStorage } from './useLocalStorage';

export interface WalletStore {
    // Props.
    wallets: Adapter[];
    autoConnect: boolean;

    // Data.
    wallet: Ref<Adapter | null>;
    publicKey: Ref<PublicKey | null>;
    ready: Ref<WalletReadyState>;
    connected: Ref<boolean>;
    connecting: Ref<boolean>;
    disconnecting: Ref<boolean>;

    // Methods.
    select(walletName: WalletName): void;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options?: SendTransactionOptions
    ): Promise<TransactionSignature>;

    signTransaction: Ref<SignerWalletAdapter['signTransaction'] | undefined>;
    signAllTransactions: Ref<SignerWalletAdapter['signAllTransactions'] | undefined>;
    signMessage: Ref<MessageSignerWalletAdapter['signMessage'] | undefined>;
}

export interface WalletStoreProps {
    wallets: Adapter[];
    autoConnect?: boolean;
    onError?: (error: WalletError) => void;
    localStorageKey?: string;
}

const walletStoreKey: InjectionKey<WalletStore> = Symbol();
let globalWalletStore: WalletStore | null = null;

export const useWallet = (): WalletStore => {
    const providedWalletStore = inject(walletStoreKey, undefined);
    if (providedWalletStore) return providedWalletStore;
    if (globalWalletStore) return globalWalletStore;
    throw new Error('Wallet not initialized. Please use the `WalletProvider` component to initialize the wallet.');
};

export const provideWallet = (walletStoreProps: WalletStoreProps): void => {
    provide(walletStoreKey, createWalletStore(walletStoreProps));
};

export const initWallet = (walletStoreProps: WalletStoreProps): void => {
    globalWalletStore = createWalletStore(walletStoreProps);
};

export const createWalletStore = ({
    wallets: adapters,
    autoConnect = false,
    onError = (error: WalletError) => console.error(error),
    localStorageKey = 'walletName',
}: WalletStoreProps): WalletStore => {
    const name: Ref<WalletName | null> = useLocalStorage<WalletName>(localStorageKey);
    const adapter = ref<Adapter | null>(null);
    const publicKey = ref<PublicKey | null>(null);
    const ready = ref<WalletReadyState>(WalletReadyState.NotDetected);
    const connected = ref<boolean>(false);
    const connecting = ref<boolean>(false);
    const disconnecting = ref<boolean>(false);

    // Helper methods to set and reset the main state variables.
    const setState = (state: {
        adapter: Adapter | null;
        publicKey: PublicKey | null;
        ready: WalletReadyState;
        connected: boolean;
    }) => {
        adapter.value = state.adapter;
        ready.value = state.ready;
        publicKey.value = state.publicKey;
        connected.value = state.connected;
    };
    const resetState = () => {
        setState({
            adapter: null,
            ready: WalletReadyState.NotDetected,
            publicKey: null,
            connected: false,
        });
    };

    // Create a dictionary of wallet adapters keyed by their name.
    const adaptersByName = computed(() => {
        return adapters.reduce<Record<WalletName, Adapter>>((adaptersByName, adapter) => {
            adaptersByName[adapter.name] = adapter;
            return adaptersByName;
        }, {});
    });

    // Update the wallet adapter based on the wallet provider.
    watch(
        name,
        (): void => {
            const adapter = adaptersByName.value?.[name.value as WalletName] ?? null;
            if (adapter) {
                setState({
                    adapter: adapter,
                    ready: adapter.readyState,
                    publicKey: adapter.publicKey,
                    connected: adapter.connected
                });
            } else {
                resetState();
            }
        },
        { immediate: true }
    );

    // Select a wallet adapter by name.
    const select = async (walletName: WalletName): Promise<void> => {
        if (name.value === walletName) return;
        name.value = walletName;
    };

    // Handle the wallet adapter events.
    const onReadyStateChange = () => {
        if (!adapter?.value) return;
        ready.value = adapter.value.readyState;
    }
    const onDisconnect = () => (name.value = null);
    const onConnect = () => {
        if (!adapter?.value) return;
        publicKey.value = adapter.value.publicKey;
        connected.value = adapter.value.connected;
    };
    const invalidateListeners = watchEffect((onInvalidate) => {
        const _adapter = adapter.value;
        if (!_adapter) return;

        _adapter.on('readyStateChange', onReadyStateChange);
        _adapter.on('connect', onConnect);
        _adapter.on('disconnect', onDisconnect);
        _adapter.on('error', onError);

        onInvalidate(() => {
            _adapter.off('readyStateChange', onReadyStateChange);
            _adapter.off('connect', onConnect);
            _adapter.off('disconnect', onDisconnect);
            _adapter.off('error', onError);
        });
    });

    if (typeof window !== 'undefined') {
        // Ensure the wallet listeners are invalidated before refreshing the page.
        // This is because Vue does not unmount components when the page is being refreshed.
        window.addEventListener('beforeunload', invalidateListeners);
    }

    // Helper method to return an error whilst using the onError callback.
    const newError = (error: WalletError): WalletError => {
        onError(error);
        return error;
    };

    // Connect the wallet.
    const connect = async (): Promise<void> => {
        if (connected.value || connecting.value || disconnecting.value) return;
        if (!adapter.value) throw newError(new WalletNotSelectedError());

        if (!ready.value) {
            name.value = null;

            if (typeof window !== 'undefined') {
                window.open(adapter.value.url, '_blank');
            }

            throw newError(new WalletNotReadyError());
        }

        try {
            connecting.value = true;
            await adapter.value.connect();
        } catch (error: any) {
            name.value = null;
            throw error;
        } finally {
            connecting.value = false;
        }
    };

    // Disconnect the wallet adapter.
    const disconnect = async (): Promise<void> => {
        if (disconnecting.value) return;
        if (!adapter.value) {
            name.value = null;
            return;
        }

        try {
            disconnecting.value = true;
            await adapter.value.disconnect();
        } finally {
            name.value = null;
            disconnecting.value = false;
        }
    };

    // Send a transaction using the provided connection.
    const sendTransaction = async (
        transaction: Transaction,
        connection: Connection,
        options?: SendTransactionOptions
    ) => {
        if (!adapter.value) throw newError(new WalletNotSelectedError());
        if (!connected.value) throw newError(new WalletNotConnectedError());
        return await adapter.value.sendTransaction(transaction, connection, options);
    };

    // Sign a transaction if the wallet supports it.
    const signTransaction = computed(() => {
        const _adapter = adapter.value;
        if (!(_adapter && 'signTransaction' in _adapter)) return;

        return async (transaction: Transaction) => {
            if (!connected.value) throw newError(new WalletNotConnectedError());
            return await _adapter.signTransaction(transaction);
        };
    });

    // Sign multiple transactions if the wallet adapter supports it
    const signAllTransactions = computed(() => {
        const _adapter = adapter.value;
        if (!(_adapter && 'signAllTransactions' in _adapter)) return;
        return async (transactions: Transaction[]) => {
            if (!connected.value) throw newError(new WalletNotConnectedError());
            return await _adapter.signAllTransactions(transactions);
        };
    });

    // Sign an arbitrary message if the wallet adapter supports it.
    const signMessage = computed(() => {
        const _adapter = adapter.value;
        if (!(_adapter && 'signMessage' in _adapter)) return;
        return async (message: Uint8Array) => {
            if (!connected.value) throw newError(new WalletNotConnectedError());
            return await _adapter.signMessage(message);
        };
    });

    // If autoConnect is enabled, try to connect when the wallet adapter changes and is ready.
    watchEffect(async (): Promise<void> => {
        if (!autoConnect || !adapter.value || !ready.value || connected.value || connecting.value) return;
        try {
            connecting.value = true;
            await adapter.value.connect();
        } catch (error: any) {
            // Clear the selected wallet
            name.value = null;
            // Don't throw error, but onError will still be called
        } finally {
            connecting.value = false;
        }
    });

    // Return the created store.
    return {
        // Props.
        wallets: adapters,
        autoConnect,

        // Data.
        wallet: adapter,
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
