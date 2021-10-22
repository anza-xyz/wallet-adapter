import {
    SendTransactionOptions,
    WalletAdapter,
    WalletError,
    WalletNotConnectedError,
    WalletNotReadyError,
} from '@solana/wallet-adapter-base';
import { Wallet, WalletName } from '@solana/wallet-adapter-wallets';
import { Connection, Transaction } from '@solana/web3.js';
import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WalletNotSelectedError } from './errors';
import { useLocalStorage } from './useLocalStorage';
import { WalletContext } from './useWallet';

export interface WalletProviderProps {
    children: ReactNode;
    wallets: Wallet[];
    autoConnect?: boolean;
    onError?: (error: WalletError) => void;
    localStorageKey?: string;
}

const initialState: {
    wallet: Wallet | null;
    adapter: ReturnType<Wallet['adapter']> | null;
} & Pick<WalletAdapter, 'ready' | 'publicKey' | 'connected'> = {
    wallet: null,
    adapter: null,
    ready: false,
    publicKey: null,
    connected: false,
};

export const WalletProvider: FC<WalletProviderProps> = ({
    children,
    wallets,
    autoConnect = false,
    onError: _onError = (error: WalletError) => console.error(error),
    localStorageKey = 'walletName',
}) => {
    const [name, setName] = useLocalStorage<WalletName | null>(localStorageKey, null);
    const [{ wallet, adapter, ready, publicKey, connected }, setState] = useState(initialState);
    const [connecting, setConnecting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const isConnecting = useRef(false);
    const isDisconnecting = useRef(false);
    const isUnloading = useRef(false);

    // Map of wallet names to wallets
    const walletsByName = useMemo(
        () =>
            wallets.reduce((walletsByName, wallet) => {
                walletsByName[wallet.name] = wallet;
                return walletsByName;
            }, {} as { [name in WalletName]: Wallet }),
        [wallets]
    );

    // When the selected wallet changes, initialize the state
    useEffect(() => {
        const wallet = (name && walletsByName[name]) || null;
        const adapter = wallet && wallet.adapter();
        if (adapter) {
            const { ready, publicKey, connected } = adapter;
            setState({ wallet, adapter, connected, publicKey, ready });
        } else {
            setState(initialState);
        }
    }, [name, walletsByName, setState]);

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
                // Don't throw error, but onError will still be called
            } finally {
                setConnecting(false);
                isConnecting.current = false;
            }
        })();
    }, [isConnecting, connecting, connected, autoConnect, adapter, ready, setConnecting, setName]);

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
        async (newName: WalletName | null) => {
            if (name === newName) return;
            if (adapter) await adapter.disconnect();
            setName(newName);
        },
        [name, adapter, setName]
    );

    // Handle the adapter's ready event
    const onReady = useCallback(() => setState((state) => ({ ...state, ready: true })), [setState]);

    // Handle the adapter's connect event
    const onConnect = useCallback(() => {
        if (!adapter) return;

        const { connected, publicKey, ready } = adapter;
        setState((state) => ({
            ...state,
            connected,
            publicKey,
            ready,
        }));
    }, [adapter, setState]);

    // Handle the adapter's disconnect event
    const onDisconnect = useCallback(() => {
        // Clear the selected wallet unless the window is unloading
        if (!isUnloading.current) setName(null);
    }, [isUnloading, setName]);

    // Handle the adapter's error event, and local errors
    const onError = useCallback(
        (error: WalletError) => {
            // Call the provided error handler unless the window is unloading
            if (!isUnloading.current) _onError(error);
            return error;
        },
        [isUnloading, _onError]
    );

    // Connect the adapter to the wallet
    const connect = useCallback(async () => {
        if (isConnecting.current || connecting || disconnecting || connected) return;
        if (!wallet || !adapter) throw onError(new WalletNotSelectedError());

        if (!ready) {
            // Clear the selected wallet
            setName(null);

            if (typeof window !== 'undefined') {
                window.open(wallet.url, '_blank');
            }

            throw onError(new WalletNotReadyError());
        }

        isConnecting.current = true;
        setConnecting(true);
        try {
            await adapter.connect();
        } catch (error: any) {
            // Clear the selected wallet
            setName(null);
            // Rethrow the error, and onError will also be called
            throw error;
        } finally {
            setConnecting(false);
            isConnecting.current = false;
        }
    }, [isConnecting, connecting, disconnecting, connected, wallet, adapter, onError, ready, setConnecting, setName]);

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
            // Rethrow the error, and onError will also be called
            throw error;
        } finally {
            setDisconnecting(false);
            isDisconnecting.current = false;
        }
    }, [isDisconnecting, disconnecting, adapter, setDisconnecting, setName]);

    // Send a transaction using the provided connection
    const sendTransaction = useCallback(
        async (transaction: Transaction, connection: Connection, options?: SendTransactionOptions) => {
            if (!adapter) throw onError(new WalletNotSelectedError());
            if (!connected) throw onError(new WalletNotConnectedError());
            return await adapter.sendTransaction(transaction, connection, options);
        },
        [adapter, onError, connected]
    );

    // Sign a transaction if the wallet supports it
    const signTransaction = useMemo(
        () =>
            adapter && 'signTransaction' in adapter
                ? async (transaction: Transaction): Promise<Transaction> => {
                      if (!connected) throw onError(new WalletNotConnectedError());
                      return await adapter.signTransaction(transaction);
                  }
                : undefined,
        [adapter, onError, connected]
    );

    // Sign multiple transactions if the wallet supports it
    const signAllTransactions = useMemo(
        () =>
            adapter && 'signAllTransactions' in adapter
                ? async (transactions: Transaction[]): Promise<Transaction[]> => {
                      if (!connected) throw onError(new WalletNotConnectedError());
                      return await adapter.signAllTransactions(transactions);
                  }
                : undefined,
        [adapter, onError, connected]
    );

    // Sign an arbitrary message if the wallet supports it
    const signMessage = useMemo(
        () =>
            adapter && 'signMessage' in adapter
                ? async (message: Uint8Array): Promise<Uint8Array> => {
                      if (!connected) throw onError(new WalletNotConnectedError());
                      return await adapter.signMessage(message);
                  }
                : undefined,
        [adapter, onError, connected]
    );

    // Setup and teardown event listeners when the adapter changes
    useEffect(() => {
        if (adapter) {
            adapter.on('ready', onReady);
            adapter.on('connect', onConnect);
            adapter.on('disconnect', onDisconnect);
            adapter.on('error', onError);
            return () => {
                adapter.off('ready', onReady);
                adapter.off('connect', onConnect);
                adapter.off('disconnect', onDisconnect);
                adapter.off('error', onError);
            };
        }
    }, [adapter, onReady, onConnect, onDisconnect, onError]);

    return (
        <WalletContext.Provider
            value={{
                wallets,
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
