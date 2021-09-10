import {
    SendTransactionOptions,
    WalletAdapter,
    WalletError,
    WalletNotConnectedError,
    WalletNotReadyError,
} from '@solana/wallet-adapter-base';
import { Wallet, WalletName } from '@solana/wallet-adapter-wallets';
import { Connection, Transaction } from '@solana/web3.js';
import React, { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
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
} & Pick<WalletAdapter, 'ready' | 'publicKey' | 'connected' | 'autoApprove'> = {
    wallet: null,
    adapter: null,
    ready: false,
    publicKey: null,
    connected: false,
    autoApprove: false,
};

export const WalletProvider: FC<WalletProviderProps> = ({
    children,
    wallets,
    autoConnect = false,
    onError = (error: WalletError) => console.error(error),
    localStorageKey = 'walletName',
}) => {
    const [name, setName] = useLocalStorage<WalletName | null>(localStorageKey, null);
    const [{ wallet, adapter, ready, publicKey, connected, autoApprove }, setState] = useState(initialState);
    const [connecting, setConnecting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);

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
        const wallet = name && walletsByName[name];
        const adapter = wallet && wallet.adapter();
        if (adapter) {
            const { ready, publicKey, connected, autoApprove } = adapter;
            setState({ wallet, adapter, connected, publicKey, ready, autoApprove });
        } else {
            setState(initialState);
        }
    }, [name, walletsByName, setState]);

    // If autoConnect is enabled, try to connect when the adapter changes and is ready
    useEffect(() => {
        if (autoConnect && adapter && ready && !connecting && !connected) {
            (async function () {
                setConnecting(true);
                try {
                    await adapter.connect();
                } catch (error: any) {
                    // Clear the selected wallet
                    setName(null);
                    // Don't throw error, but onError will still be called
                } finally {
                    setConnecting(false);
                }
            })();
        }
    }, [autoConnect, adapter, ready, connecting, connected, setConnecting, setName]);

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

        const { connected, publicKey, ready, autoApprove } = adapter;
        setState((state) => ({
            ...state,
            connected,
            publicKey,
            ready,
            autoApprove,
        }));
    }, [adapter, setState]);

    // Handle the adapter's disconnect event
    const onDisconnect = useCallback(() => setState(initialState), [setState]);

    // Connect the adapter to the wallet
    const connect = useCallback(async () => {
        if (connecting || disconnecting || connected) return;

        if (!wallet || !adapter) {
            const error = new WalletNotSelectedError();
            onError(error);
            throw error;
        }

        if (!ready) {
            setName(null);

            if (typeof window !== 'undefined') {
                window.open(wallet.url, '_blank');
            }

            const error = new WalletNotReadyError();
            onError(error);
            throw error;
        }

        setConnecting(true);
        try {
            await adapter.connect();
        } catch (error: any) {
            setName(null);
            throw error;
        } finally {
            setConnecting(false);
        }
    }, [connecting, disconnecting, connected, wallet, adapter, onError, ready, setName, setConnecting]);

    // Disconnect the adapter from the wallet
    const disconnect = useCallback(async () => {
        if (disconnecting) return;
        if (!adapter) return setName(null);

        setDisconnecting(true);
        try {
            await adapter.disconnect();
        } finally {
            setName(null);
            setDisconnecting(false);
        }
    }, [disconnecting, adapter, setName, setDisconnecting]);

    // Send a transaction using the provided connection
    const sendTransaction = useCallback(
        async (transaction: Transaction, connection: Connection, options?: SendTransactionOptions) => {
            if (!adapter) {
                const error = new WalletNotSelectedError();
                onError(error);
                throw error;
            }
            if (!connected) {
                const error = new WalletNotConnectedError();
                onError(error);
                throw error;
            }

            return await adapter.sendTransaction(transaction, connection, options);
        },
        [adapter, onError, connected]
    );

    // Sign a transaction if the wallet supports it
    const signTransaction = useMemo(
        () =>
            adapter && 'signTransaction' in adapter
                ? async (transaction: Transaction): Promise<Transaction> => {
                      if (!connected) {
                          const error = new WalletNotConnectedError();
                          onError(error);
                          throw error;
                      }

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
                      if (!connected) {
                          const error = new WalletNotConnectedError();
                          onError(error);
                          throw error;
                      }

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
                      if (!connected) {
                          const error = new WalletNotConnectedError();
                          onError(error);
                          throw error;
                      }

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
                select,
                wallet,
                adapter,
                publicKey,
                ready,
                connecting,
                disconnecting,
                connected,
                autoApprove,
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
