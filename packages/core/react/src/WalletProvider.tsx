import {
    Adapter,
    SendTransactionOptions,
    Wallet,
    WalletError,
    WalletName,
    WalletNotConnectedError,
    WalletNotReadyError,
} from '@solana/wallet-adapter-base';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WalletNotSelectedError } from './errors';
import { useInitialState } from './useInitialState';
import { useLocalStorage } from './useLocalStorage';
import { EnhancedWallet, WalletContext } from './useWallet';

export interface WalletProviderProps {
    children: ReactNode;
    wallets: Wallet[];
    autoConnect?: boolean;
    onError?: (error: WalletError) => void;
    localStorageKey?: string;
}

const initialState: {
    wallet: EnhancedWallet | null;
    adapter: Adapter | null;
    ready: boolean;
    connected: boolean;
    publicKey: PublicKey | null;
} = {
    wallet: null,
    adapter: null,
    ready: false,
    connected: false,
    publicKey: null,
};

export const WalletProvider: FC<WalletProviderProps> = ({
    children,
    wallets,
    autoConnect = false,
    onError,
    localStorageKey = 'walletName',
}) => {
    const [name, setName] = useLocalStorage<WalletName | null>(localStorageKey, null);
    const [{ wallet, adapter, ready, publicKey, connected }, setState] = useState(initialState);
    const [connecting, setConnecting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const isConnecting = useRef(false);
    const isDisconnecting = useRef(false);
    const isUnloading = useRef(false);

    // When the wallets change, enhance them with additional properties
    const [enhancedWallets, setEnhancedWallets] = useInitialState(
        () => wallets.map((wallet) => ({ ...wallet, ready: false })),
        [wallets]
    );

    // When the wallets change, asynchronously update the enhanced properties
    useEffect(() => {
        let walletsChangedWhileWaiting = false;
        (async () => {
            const ready = await Promise.all(wallets.map((wallet) => wallet.adapter.ready()));
            if (!walletsChangedWhileWaiting) {
                setEnhancedWallets(wallets.map((wallet, index) => ({ ...wallet, ready: ready[index] })));
            }
        })();
        return () => {
            walletsChangedWhileWaiting = true;
        };
    }, [wallets]);

    // When the enhanced wallets change, map the wallet names to the enhanced wallets
    const enhancedWalletsByName = useMemo(
        () =>
            enhancedWallets.reduce<Record<WalletName, EnhancedWallet>>((enhancedWallets, enhancedWallet) => {
                enhancedWallets[enhancedWallet.name] = enhancedWallet;
                return enhancedWallets;
            }, {}),
        [enhancedWallets]
    );

    // When the selected wallet changes, initialize the state
    useEffect(() => {
        const wallet = (name && enhancedWalletsByName[name]) || null;
        const adapter = wallet && wallet.adapter;
        if (adapter) {
            setState({
                wallet,
                adapter,
                ready: enhancedWalletsByName[wallet.name].ready,
                connected: adapter.connected,
                publicKey: adapter.publicKey,
            });
        } else {
            setState(initialState);
        }
    }, [name, enhancedWalletsByName]);

    // If autoConnect is enabled, try to connect when the adapter changes and is ready
    useEffect(() => {
        if (isConnecting.current || connecting || connected || !autoConnect || !adapter || !ready) return;

        (async function () {
            isConnecting.current = true;
            setConnecting(true);
            try {
                await adapter.connect();
            } catch (error: any) {
                // Clear the selected wallet
                setName(null);
                // Don't throw error, but handleError will still be called
            } finally {
                setConnecting(false);
                isConnecting.current = false;
            }
        })();
    }, [isConnecting, connecting, connected, autoConnect, adapter, ready]);

    // If the window is closing or reloading, ignore disconnect and error events from the adapter
    useEffect(() => {
        function listener() {
            isUnloading.current = true;
        }

        window.addEventListener('beforeunload', listener);
        return () => window.removeEventListener('beforeunload', listener);
    }, [isUnloading]);

    // Select a wallet by name
    const select = useCallback(
        async (walletName: WalletName | null) => {
            if (name === walletName) return;
            setName(walletName);
        },
        [name]
    );

    // Handle the adapter's connect event
    const handleConnect = useCallback(() => {
        if (!adapter) return;
        setState((state) => ({ ...state, connected: adapter.connected, publicKey: adapter.publicKey }));
    }, [adapter]);

    // Handle the adapter's disconnect event
    const handleDisconnect = useCallback(() => {
        // Clear the selected wallet unless the window is unloading
        if (!isUnloading.current) setName(null);
    }, [isUnloading]);

    // Handle the adapter's error event, and local errors
    const handleError = useCallback(
        (error: WalletError) => {
            // Call onError unless the window is unloading
            if (!isUnloading.current) (onError || console.error)(error);
            return error;
        },
        [isUnloading, onError]
    );

    // Connect the adapter to the wallet
    const connect = useCallback(async () => {
        if (isConnecting.current || connecting || disconnecting || connected) return;
        if (!wallet || !adapter) throw handleError(new WalletNotSelectedError());

        if (!ready) {
            // Clear the selected wallet
            setName(null);

            if (typeof window !== 'undefined') {
                window.open(wallet.url, '_blank');
            }

            throw handleError(new WalletNotReadyError());
        }

        isConnecting.current = true;
        setConnecting(true);
        try {
            await adapter.connect();
        } catch (error: any) {
            // Clear the selected wallet
            setName(null);
            // Rethrow the error, and handleError will also be called
            throw error;
        } finally {
            setConnecting(false);
            isConnecting.current = false;
        }
    }, [isConnecting, connecting, disconnecting, connected, wallet, adapter, handleError, ready]);

    // Disconnect the adapter from the wallet
    const disconnect = useCallback(async () => {
        if (isDisconnecting.current || disconnecting) return;
        if (!adapter) return setName(null);

        isDisconnecting.current = true;
        setDisconnecting(true);
        try {
            await adapter.disconnect();
        } catch (error: any) {
            // Clear the selected wallet
            setName(null);
            // Rethrow the error, and handleError will also be called
            throw error;
        } finally {
            setDisconnecting(false);
            isDisconnecting.current = false;
        }
    }, [isDisconnecting, disconnecting, adapter]);

    // Send a transaction using the provided connection
    const sendTransaction = useCallback(
        async (transaction: Transaction, connection: Connection, options?: SendTransactionOptions) => {
            if (!adapter) throw handleError(new WalletNotSelectedError());
            if (!connected) throw handleError(new WalletNotConnectedError());
            return await adapter.sendTransaction(transaction, connection, options);
        },
        [adapter, handleError, connected]
    );

    // Sign a transaction if the wallet supports it
    const signTransaction = useMemo(
        () =>
            adapter && 'signTransaction' in adapter
                ? async (transaction: Transaction): Promise<Transaction> => {
                      if (!connected) throw handleError(new WalletNotConnectedError());
                      return await adapter.signTransaction(transaction);
                  }
                : undefined,
        [adapter, handleError, connected]
    );

    // Sign multiple transactions if the wallet supports it
    const signAllTransactions = useMemo(
        () =>
            adapter && 'signAllTransactions' in adapter
                ? async (transactions: Transaction[]): Promise<Transaction[]> => {
                      if (!connected) throw handleError(new WalletNotConnectedError());
                      return await adapter.signAllTransactions(transactions);
                  }
                : undefined,
        [adapter, handleError, connected]
    );

    // Sign an arbitrary message if the wallet supports it
    const signMessage = useMemo(
        () =>
            adapter && 'signMessage' in adapter
                ? async (message: Uint8Array): Promise<Uint8Array> => {
                      if (!connected) throw handleError(new WalletNotConnectedError());
                      return await adapter.signMessage(message);
                  }
                : undefined,
        [adapter, handleError, connected]
    );

    // Setup and teardown event listeners when the adapter changes
    useEffect(() => {
        if (adapter) {
            adapter.on('connect', handleConnect);
            adapter.on('disconnect', handleDisconnect);
            adapter.on('error', handleError);
            return () => {
                adapter.off('connect', handleConnect);
                adapter.off('disconnect', handleDisconnect);
                adapter.off('error', handleError);
            };
        }
    }, [adapter, handleConnect, handleDisconnect, handleError]);

    // When the adapter changes, disconnect the old one.
    useEffect(() => {
        return () => {
            adapter?.disconnect();
        };
    }, [adapter]);

    return (
        <WalletContext.Provider
            value={{
                wallets: enhancedWallets,
                walletsByName: enhancedWalletsByName,
                autoConnect,
                wallet,
                adapter,
                publicKey,
                ready,
                connected,
                connecting,
                disconnecting,
                select,
                connect,
                disconnect,
                sendTransaction,
                signTransaction,
                signAllTransactions,
                signMessage,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};
