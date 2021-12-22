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
    WalletReadyState,
} from '@solana/wallet-adapter-base';
import { Connection, PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';
import { computed, inject, InjectionKey, provide, Ref, ref, watch, watchEffect } from '@vue/runtime-core';
import { WalletNotSelectedError } from './errors';
import { useLocalStorage } from './useLocalStorage';

interface WalletWithReadyState extends Wallet {
    readyState: WalletReadyState | null;
}
export interface WalletStore {
    // Props.
    wallets: Wallet[];
    autoConnect: boolean;

    // Data.
    wallet: Ref<WalletWithReadyState | null>;
    publicKey: Ref<PublicKey | null>;
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
    const wallet = ref<WalletWithReadyState | null>(null);
    const adapter = ref<Adapter | null>(null);
    const publicKey = ref<PublicKey | null>(null);
    const connected = ref<boolean>(false);
    const connecting = ref<boolean>(false);
    const disconnecting = ref<boolean>(false);

    // Helper methods to set and reset the main state variables.
    const setState = (state: {
        wallet: Wallet | null;
        adapter: Adapter | null;
        publicKey: PublicKey | null;
        connected: boolean;
    }) => {
        wallet.value = state.wallet
            ? {
                  ...state.wallet,
                  readyState: state.wallet.adapter.readyState,
              }
            : null;
        adapter.value = state.adapter;
        publicKey.value = state.publicKey;
        connected.value = state.connected;
    };
    const resetState = () => {
        setState({
            wallet: null,
            adapter: null,
            publicKey: null,
            connected: false,
        });
    };

    // Wrap wallets to conform to the `WalletsWithReadyState` interface.
    const walletsWithReadyState = computed(() =>
        wallets.map((wallet) => ({
            ...wallet,
            readyState: wallet.adapter.readyState,
        }))
    );

    // When the wallets change, start to listen for changes to their `readyState`.
    watch(wallets, (_oldWallets, _newWallets, onInvalidate) => {
        function handleReadyStateChange(this: Wallet, nextReadyState: WalletReadyState) {
            // FIXME: Did not test this; don't know if this is the Vue-y way to achieve this.
            const walletToUpdate = walletsWithReadyState.value.find(({ name }) => name === this.name);
            if (walletToUpdate) {
                walletToUpdate.readyState = nextReadyState;
            }
        }
        wallets.forEach((wallet) => {
            wallet.adapter.on('readyStateChange', handleReadyStateChange, wallet);
        });
        onInvalidate(() => {
            wallets.forEach((wallet) => {
                wallet.adapter.off('readyStateChange', handleReadyStateChange, wallet);
            });
        });
    });

    // Update the wallet and adapter based on the wallet provider.
    watch(
        name,
        (): void => {
            const wallet = walletsWithReadyState.value.find(({ name: walletName }) => walletName === name.value);
            const adapter = wallet && wallet.adapter;
            if (adapter) {
                setState({
                    wallet,
                    adapter,
                    publicKey: adapter.publicKey,
                    connected: adapter.connected,
                });
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

        if (
            !(
                wallet.value.readyState === WalletReadyState.Installed ||
                wallet.value.readyState === WalletReadyState.Loadable
            )
        ) {
            name.value = null;
            window.open(wallet.value.url, '_blank');
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
        if (
            !autoConnect ||
            !adapter.value ||
            !wallet.value ||
            !(
                wallet.value.readyState === WalletReadyState.Installed ||
                wallet.value.readyState === WalletReadyState.Loadable
            ) ||
            connected.value ||
            connecting.value
        )
            return;
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
        publicKey,
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
