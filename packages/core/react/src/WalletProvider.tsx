import {
    SendTransactionOptions,
    Wallet,
    WalletError,
    WalletName,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletReadyState,
} from '@solana/wallet-adapter-base';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WalletNotSelectedError } from './errors';
import { useLocalStorage } from './useLocalStorage';
import { WalletContext, WalletWithReadyState } from './useWallet';

export interface WalletProviderProps {
    children: ReactNode;
    wallets: Wallet[];
    autoConnect?: boolean;
    onError?: (error: WalletError) => void;
    localStorageKey?: string;
}

const initialState: {
    wallet: WalletWithReadyState | null;
    connected: boolean;
    publicKey: PublicKey | null;
} = {
    wallet: null,
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
    const [{ wallet, publicKey, connected }, setState] = useState(initialState);
    const adapter = wallet?.adapter;
    const readyState = wallet?.readyState;
    const [connecting, setConnecting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const isConnecting = useRef(false);
    const isDisconnecting = useRef(false);
    const isUnloading = useRef(false);

    // Wrap wallets to conform to the `WalletsWithReadyState` interface.
    const [walletsWithReadyState, setWalletsWithReadyState] = useState(() =>
        wallets.map((wallet) => ({
            ...wallet,
            readyState: wallet.adapter.readyState,
        }))
    );

    // When the wallets change, start to listen for changes to their `readyState`.
    useEffect(() => {
        function handleReadyStateChange(this: Wallet, nextReadyState: WalletReadyState) {
            setWalletsWithReadyState((prevWallets) => {
                const walletIndex = prevWallets.findIndex(({ name }) => name === this.name);
                if (walletIndex === -1) {
                    return prevWallets;
                } else {
                    return [
                        ...prevWallets.slice(0, walletIndex),
                        { ...prevWallets[walletIndex], readyState: nextReadyState },
                        ...prevWallets.slice(walletIndex + 1),
                    ];
                }
            });
        }
        walletsWithReadyState.forEach((wallet) => {
            wallet.adapter.on('readyStateChange', handleReadyStateChange, wallet);
        });
        return () => {
            walletsWithReadyState.forEach((wallet) => {
                wallet.adapter.off('readyStateChange', handleReadyStateChange, wallet);
            });
        };
    }, [walletsWithReadyState]);

    // When the selected wallet changes, initialize the state
    useEffect(() => {
        const wallet = walletsWithReadyState.find(({ name: walletName }) => walletName === name);
        if (wallet) {
            const { adapter } = wallet;
            const { publicKey, connected } = adapter;
            setState({ wallet, connected, publicKey });
        } else {
            setState(initialState);
        }
    }, [name, walletsWithReadyState]);

    // If autoConnect is enabled, try to connect when the adapter changes and is ready
    useEffect(() => {
        if (
            isConnecting.current ||
            connecting ||
            connected ||
            !autoConnect ||
            !adapter ||
            !(readyState === WalletReadyState.Installed || readyState === WalletReadyState.Loadable)
        )
            return;

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
    }, [isConnecting, connecting, connected, autoConnect, adapter, readyState]);

    // If the window is closing or reloading, ignore disconnect and error events from the adapter
    useEffect(() => {
        function listener() {
            isUnloading.current = true;
        }

        window.addEventListener('beforeunload', listener);
        return () => window.removeEventListener('beforeunload', listener);
    }, [isUnloading]);

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
        if (!adapter) throw handleError(new WalletNotSelectedError());

        if (!(readyState === WalletReadyState.Installed || readyState === WalletReadyState.Loadable)) {
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
    }, [isConnecting, connecting, disconnecting, connected, adapter, readyState, handleError]);

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
                wallets: walletsWithReadyState,
                autoConnect,
                wallet,
                adapter: adapter ?? null,
                publicKey,
                connected,
                connecting,
                disconnecting,
                select: setName,
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
