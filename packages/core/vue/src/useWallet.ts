import { Connection, PublicKey, Transaction } from '@solana/web3.js';
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
import { ref, computed, Ref, watch, watchEffect } from '@vue/runtime-core';
import { useLocalStorage } from './useLocalStorage';
import { WalletNotSelectedError } from './errors';

type Adapter = ReturnType<Wallet['adapter']>;
type WalletDictionary = { [key: string]: Wallet };

export interface WalletStore extends WalletAdapterProps {
    wallets: Wallet[];
    autoConnect: boolean;

    wallet: Wallet | null;
    adapter: Adapter | null;
    disconnecting: boolean;

    select(walletName: WalletName): void;
    signTransaction: SignerWalletAdapterProps['signTransaction'] | undefined;
    signAllTransactions: SignerWalletAdapterProps['signAllTransactions'] | undefined;
    signMessage: MessageSignerWalletAdapterProps['signMessage'] | undefined;
}

export interface WalletStoreProps {
    wallets: Wallet[];
    autoConnect?: boolean;
    onError?: (error: WalletError) => void;
    localStorageKey?: string;
}

let walletStore: object = {} as object;

export const useWallet = (): object => walletStore;

export const initWallet = ({
    wallets,
    autoConnect = false,
    onError = (error: WalletError) => console.error(error),
    localStorageKey = 'walletName',
}: WalletStoreProps): void => {
    const walletProvider: Ref<string | null> = useLocalStorage<string>(localStorageKey);
    const wallet: Ref<Wallet | null> = ref<Wallet | null>(null);
    const adapter: Ref<Adapter | null> = ref<Adapter | null>(null);
    const publicKey: Ref<PublicKey | null> = ref<PublicKey | null>(null);
    const ready: Ref<boolean | null> = ref<boolean | null>(false);
    const connected: Ref<boolean | null> = ref<boolean | null>(false);
    const connecting: Ref<boolean | null> = ref<boolean | null>(false);
    const disconnecting: Ref<boolean | null> = ref<boolean | null>(false);

    const walletsByProvider: Ref<WalletDictionary> = computed<WalletDictionary>(() => {
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
        if (! adapter?.value || !('signTransaction' in adapter.value)) return
        if (! connected.value) throw newError(new WalletNotConnectedError())
        return await adapter.value.signTransaction(transaction)
    }

    // Sign multiple transactions if the wallet supports it
    const signAllTransactions = async (transactions: Transaction[]) => {
        if (! adapter?.value || !('signAllTransactions' in adapter.value)) return
        if (! connected.value) throw newError(new WalletNotConnectedError())
        return await adapter.value.signAllTransactions(transactions)
    }

    // Sign an arbitrary message if the wallet supports it.
    const signMessage = async (message: Uint8Array) => {
        if (! adapter?.value || !('signMessage' in adapter.value)) return
        if (! connected.value) throw newError(new WalletNotConnectedError())
        return await adapter.value.signMessage(message)
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
