import {
    Adapter,
    MessageSignerWalletAdapter,
    SendTransactionOptions,
    SignerWalletAdapter,
    Wallet,
    WalletError,
    WalletName,
    WalletNotConnectedError,
    WalletNotReadyError,
} from '@solana/wallet-adapter-base';
import { Connection, PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';
import { computed, inject, InjectionKey, provide, Ref, ref, watch, watchEffect } from '@vue/runtime-core';
import { WalletNotSelectedError } from './errors';
import { useLocalStorage } from './useLocalStorage';

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
    wallets: Wallet[];
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
    wallets,
    autoConnect = false,
    onError = (error: WalletError) => console.error(error),
    localStorageKey = 'walletName',
}: WalletStoreProps): WalletStore => {
    const name: Ref<WalletName | null> = useLocalStorage<WalletName>(localStorageKey);
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
    };
    const resetState = () => {
        setState({
            wallet: null,
            adapter: null,
            ready: false,
            publicKey: null,
            connected: false,
        });
    };

    // Create a wallet dictionary keyed by their name.
    const walletsByName = computed(() => {
        return wallets.reduce<Record<WalletName, Wallet>>((walletsByName, wallet) => {
            walletsByName[wallet.name] = wallet;
            return walletsByName;
        }, {});
    });

    // Update the wallet and adapter based on the wallet provider.
    watch(
        name,
        (): void => {
            const wallet = walletsByName.value?.[name.value as WalletName] ?? null;
            const adapter = wallet && wallet.adapter;
            if (adapter) {
                setState({
                    wallet,
                    adapter,
                    ready: false,
                    publicKey: adapter.publicKey,
                    connected: adapter.connected,
                });

                // Asynchronously update the ready state
                const waiting = name;
                (async function () {
                    const readyValue = await adapter.ready();
                    // If the selected wallet hasn't changed while waiting, update the ready state
                    if (name === waiting) {
                        ready.value = readyValue;
                    }
                })();
            } else {
                resetState();
            }
        },
        { immediate: true }
    );

    // Select a wallet by name.
    const select = async (walletName: WalletName): Promise<void> => {
        if (name.value === walletName) return;
        if (adapter.value) await adapter.value.disconnect();
        name.value = walletName;
    };

    // Handle the adapter events.
    const onDisconnect = () => (name.value = null);
    const onConnect = () => {
        if (!adapter.value) return;
        publicKey.value = adapter.value.publicKey;
        connected.value = adapter.value.connected;
    };
    const invalidateListeners = watchEffect((onInvalidate) => {
        const _adapter = adapter.value;
        if (!_adapter) return;

        _adapter.on('connect', onConnect);
        _adapter.on('disconnect', onDisconnect);
        _adapter.on('error', onError);

        onInvalidate(() => {
            _adapter.off('connect', onConnect);
            _adapter.off('disconnect', onDisconnect);
            _adapter.off('error', onError);
        });
    });

    if (typeof window !== 'undefined') {
        // Ensure the adapter listeners are invalidated before refreshing the page.
        // This is because Vue does not unmount components when the page is being refreshed.
        window.addEventListener('beforeunload', invalidateListeners);
    }

    // Helper method to return an error whilst using the onError callback.
    const newError = (error: WalletError): WalletError => {
        onError(error);
        return error;
    };

    // Connect the adapter to the wallet.
    const connect = async (): Promise<void> => {
        if (connected.value || connecting.value || disconnecting.value) return;
        if (!wallet.value || !adapter.value) throw newError(new WalletNotSelectedError());

        if (!ready.value) {
            name.value = null;

            if (typeof window !== 'undefined') {
                window.open(wallet.value.url, '_blank');
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

    // Disconnect the adapter from the wallet.
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

    // Sign multiple transactions if the wallet supports it
    const signAllTransactions = computed(() => {
        const _adapter = adapter.value;
        if (!(_adapter && 'signAllTransactions' in _adapter)) return;
        return async (transactions: Transaction[]) => {
            if (!connected.value) throw newError(new WalletNotConnectedError());
            return await _adapter.signAllTransactions(transactions);
        };
    });

    // Sign an arbitrary message if the wallet supports it.
    const signMessage = computed(() => {
        const _adapter = adapter.value;
        if (!(_adapter && 'signMessage' in _adapter)) return;
        return async (message: Uint8Array) => {
            if (!connected.value) throw newError(new WalletNotConnectedError());
            return await _adapter.signMessage(message);
        };
    });

    // If autoConnect is enabled, try to connect when the adapter changes and is ready.
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
