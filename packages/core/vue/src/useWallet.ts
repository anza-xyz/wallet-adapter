import { ref, Ref, computed, watch, watchEffect } from '@vue/runtime-core';
import { Connection, PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';
import {
    MessageSignerWalletAdapterProps,
    SignerWalletAdapterProps,
    WalletAdapterProps,
    SendTransactionOptions,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletError,
} from '@solana/wallet-adapter-base';
import { Wallet, WalletName } from '@solana/wallet-adapter-wallets';
import { useLocalStorage } from './useLocalStorage';
import { WalletNotSelectedError, OperationNotSupportedByWalletError } from './errors';

type Adapter = ReturnType<Wallet['adapter']>;
type WalletDictionary = { [key: string]: Wallet };

export interface WalletStore {
    wallets: Wallet[];
    autoConnect: boolean;

    wallet: Ref<Wallet | null>;
    adapter: Ref<Adapter | null>;
    disconnecting: Ref<boolean>;

    publicKey: Ref<PublicKey | null>;
    ready: Ref<boolean>;
    connecting: Ref<boolean>;
    connected: Ref<boolean>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    select(walletName: WalletName): void;
    
    sendTransaction(transaction: Transaction, connection: Connection, options?: SendTransactionOptions): Promise<TransactionSignature>;
    signTransaction: SignerWalletAdapterProps['signTransaction'];
    signAllTransactions: SignerWalletAdapterProps['signAllTransactions'];
    signMessage: MessageSignerWalletAdapterProps['signMessage'];
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
    const walletProvider = useLocalStorage<string>(localStorageKey);
    const wallet = ref<Wallet | null>(null);
    const adapter = ref<Adapter | null>(null);
    const publicKey = ref<PublicKey | null>(null);
    const ready = ref<boolean>(false);
    const connected = ref<boolean>(false);
    const connecting = ref<boolean>(false);
    const disconnecting = ref<boolean>(false);

    const walletsByProvider = computed<WalletDictionary>(() => {
        return wallets.reduce((walletsByProvider, wallet) => {
            walletsByProvider[wallet.name] = wallet
            return walletsByProvider
        }, {} as WalletDictionary)
    })

    // DEBUG
    watchEffect(() => { console.log('walletProvider => ', walletProvider) })
    watchEffect(() => { console.log('wallet => ', wallet) })
    watchEffect(() => { console.log('adapter => ', adapter) })
    watchEffect(() => { console.log('publicKey => ', publicKey) })
    watchEffect(() => { console.log('ready => ', ready) })
    watchEffect(() => { console.log('connected => ', connected) })
    watchEffect(() => { console.log('connecting => ', connecting) })
    watchEffect(() => { console.log('walletsByProvider => ', walletsByProvider) })

    // Update the wallet and adapter based on the wallet provider.
    watch(walletProvider, (): void => {
        wallet.value = walletsByProvider.value?.[walletProvider.value as string] ?? null
        adapter.value = wallet.value?.adapter() ?? null
        if (adapter.value) {
            ready.value = adapter.value.ready
            publicKey.value = adapter.value.publicKey
            connected.value = adapter.value.connected
        } else {
            ready.value = false
            publicKey.value = null
            connected.value = false
        }
    }, { immediate:true })

    // Select a wallet by name.
    const select = async (newWalletProvider: string): Promise<void> => {
        if (walletProvider.value === newWalletProvider) return
        if (adapter.value) await adapter.value.disconnect()
        walletProvider.value = newWalletProvider
    }

    // Handle the adapter events.
    const onReady = () => ready.value = true
    const onConnect = () => {
        if (! adapter.value) return
        ready.value = adapter.value.ready
        publicKey.value = adapter.value.publicKey
        connected.value = adapter.value.connected
    }
    watchEffect(onInvalidate => {
        if (! adapter.value) return
        adapter.value.on('ready', onReady)
        adapter.value.on('connect', onConnect)
        adapter.value.on('error', onError)
        onInvalidate(() => {
            if (! adapter.value) return
            adapter.value.off('ready', onReady)
            adapter.value.off('connect', onConnect)
            adapter.value.off('error', onError)
        })
    })

    // Helper method to return an error whilst using the onError callback.
    const newError = (error: WalletError): WalletError => {
        onError(error)
        return error
    }

    // Connect the adapter to the wallet.
    const connect = async (): Promise<void> => {
        if (connected.value || connecting.value || disconnecting.value) return
        if (! wallet.value || ! adapter.value) throw newError(new WalletNotSelectedError())

        if (! ready.value) {
            walletProvider.value = null
            window.open(wallet.value.url, '_blank')
            throw newError(new WalletNotReadyError())
        }

        try {
            connecting.value = true
            await adapter.value.connect()
        } catch (error: any) {
            walletProvider.value = null
            throw error
        } finally {
            connecting.value = false
        }
    }

    // Disconnect the adapter from the wallet.
    const disconnect = async () => {
        if (disconnecting.value) return
        if (! adapter.value) return walletProvider.value = null

        try {
            disconnecting.value = true
            await adapter.value.disconnect()
        } finally {
            walletProvider.value = null
            disconnecting.value = false
        }
    }

    // Send a transaction using the provided connection.
    const sendTransaction = async (transaction: Transaction, connection: Connection, options?: SendTransactionOptions) => {
        if (! adapter.value) throw newError(new WalletNotSelectedError())
        if (! connected.value) throw newError(new WalletNotConnectedError())
        return await adapter.value.sendTransaction(transaction, connection, options)
    }

    // Sign a transaction if the wallet supports it.
    const signTransaction = async (transaction: Transaction) => {
        if (! adapter.value) throw newError(new WalletNotSelectedError())
        if (! connected.value) throw newError(new WalletNotConnectedError())
        if (!('signTransaction' in adapter.value)) throw newError(new OperationNotSupportedByWalletError())
        return await adapter.value.signTransaction(transaction)
    }

    // Sign multiple transactions if the wallet supports it
    const signAllTransactions = async (transactions: Transaction[]) => {
        if (! adapter.value) throw newError(new WalletNotSelectedError())
        if (! connected.value) throw newError(new WalletNotConnectedError())
        if (!('signAllTransactions' in adapter.value)) throw newError(new OperationNotSupportedByWalletError())
        return await adapter.value.signAllTransactions(transactions)
    }

    // Sign an arbitrary message if the wallet supports it.
    const signMessage = async (message: Uint8Array) => {
        if (! adapter.value) throw newError(new WalletNotSelectedError())
        if (! connected.value) throw newError(new WalletNotConnectedError())
        if (!('signMessage' in adapter.value)) throw newError(new OperationNotSupportedByWalletError())
        return await adapter.value.signMessage(message);
    }

    // If autoConnect is enabled, try to connect when the adapter changes and is ready.
    watchEffect(async (): Promise<void> => {
        if (! autoConnect || ! adapter.value || ! ready.value || connected.value || connecting.value) return;
        await connect();
    })

    walletStore = {
        // Data
        walletProvider,
        walletsByProvider,
        wallet,
        adapter,
        publicKey,
        ready,
        connected,
        connecting,
        disconnecting,

        // Methods
        select,
        connect,
        disconnect,
        sendTransaction,
        signTransaction,
        signAllTransactions,
        signMessage,
    }
}
