import {
    type Adapter,
    type MessageSignerWalletAdapterProps,
    type SignerWalletAdapterProps,
    type SignInMessageSignerWalletAdapterProps,
    type WalletAdapterProps,
    type WalletError,
    type WalletName,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletReadyState,
} from '@solana/wallet-adapter-base';
import { type PublicKey } from '@solana/web3.js';
import React, { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WalletNotSelectedError } from './errors.js';
import { WalletContext } from './useWallet.js';

export interface WalletProviderBaseProps {
    children: ReactNode;
    wallets: Adapter[];
    adapter: Adapter | null;
    isUnloadingRef: React.RefObject<boolean>;
    // NOTE: The presence/absence of this handler implies that auto-connect is enabled/disabled.
    onAutoConnectRequest?: () => Promise<void>;
    onConnectError: () => void;
    onError?: (error: WalletError, adapter?: Adapter) => void;
    onSelectWallet: (walletName: WalletName | null) => void;
}

export function WalletProviderBase({
    children,
    wallets: adapters,
    adapter,
    isUnloadingRef,
    onAutoConnectRequest,
    onConnectError,
    onError,
    onSelectWallet,
}: WalletProviderBaseProps) {
    const isConnectingRef = useRef(false);
    const [connecting, setConnecting] = useState(false);
    const isDisconnectingRef = useRef(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [publicKey, setPublicKey] = useState(() => adapter?.publicKey ?? null);
    const [connected, setConnected] = useState(() => adapter?.connected ?? false);

    /**
     * Store the error handlers as refs so that a change in the
     * custom error handler does not recompute other dependencies.
     */
    const onErrorRef = useRef(onError);
    useEffect(() => {
        onErrorRef.current = onError;
        return () => {
            onErrorRef.current = undefined;
        };
    }, [onError]);
    const handleErrorRef = useRef((error: WalletError, adapter?: Adapter) => {
        if (!isUnloadingRef.current) {
            if (onErrorRef.current) {
                onErrorRef.current(error, adapter);
            } else {
                console.error(error, adapter);
                if (error instanceof WalletNotReadyError && typeof window !== 'undefined' && adapter) {
                    window.open(adapter.url, '_blank');
                }
            }
        }
        return error;
    });

    // Wrap adapters to conform to the `Wallet` interface
    const [wallets, setWallets] = useState(() =>
        adapters
            .map((adapter) => ({
                adapter,
                readyState: adapter.readyState,
            }))
            .filter(({ readyState }) => readyState !== WalletReadyState.Unsupported)
    );

    // When the adapters change, start to listen for changes to their `readyState`
    useEffect(() => {
        // When the adapters change, wrap them to conform to the `Wallet` interface
        setWallets((wallets) =>
            adapters
                .map((adapter, index) => {
                    const wallet = wallets[index];
                    // If the wallet hasn't changed, return the same instance
                    return wallet && wallet.adapter === adapter && wallet.readyState === adapter.readyState
                        ? wallet
                        : {
                              adapter: adapter,
                              readyState: adapter.readyState,
                          };
                })
                .filter(({ readyState }) => readyState !== WalletReadyState.Unsupported)
        );
        function handleReadyStateChange(this: Adapter, readyState: WalletReadyState) {
            setWallets((prevWallets) => {
                const index = prevWallets.findIndex(({ adapter }) => adapter === this);
                if (index === -1) return prevWallets;

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const { adapter } = prevWallets[index]!;
                return [
                    ...prevWallets.slice(0, index),
                    { adapter, readyState },
                    ...prevWallets.slice(index + 1),
                ].filter(({ readyState }) => readyState !== WalletReadyState.Unsupported);
            });
        }
        adapters.forEach((adapter) => adapter.on('readyStateChange', handleReadyStateChange, adapter));
        return () => {
            adapters.forEach((adapter) => adapter.off('readyStateChange', handleReadyStateChange, adapter));
        };
    }, [adapter, adapters]);

    const wallet = useMemo(() => wallets.find((wallet) => wallet.adapter === adapter) ?? null, [adapter, wallets]);

    // Setup and teardown event listeners when the adapter changes
    useEffect(() => {
        if (!adapter) return;

        const handleConnect = (publicKey: PublicKey) => {
            setPublicKey(publicKey);
            isConnectingRef.current = false;
            setConnecting(false);
            setConnected(true);
            isDisconnectingRef.current = false;
            setDisconnecting(false);
        };

        const handleDisconnect = () => {
            if (isUnloadingRef.current) return;

            setPublicKey(null);
            isConnectingRef.current = false;
            setConnecting(false);
            setConnected(false);
            isDisconnectingRef.current = false;
            setDisconnecting(false);
        };

        const handleError = (error: WalletError) => {
            handleErrorRef.current(error, adapter);
        };

        adapter.on('connect', handleConnect);
        adapter.on('disconnect', handleDisconnect);
        adapter.on('error', handleError);

        return () => {
            adapter.off('connect', handleConnect);
            adapter.off('disconnect', handleDisconnect);
            adapter.off('error', handleError);

            handleDisconnect();
        };
    }, [adapter, isUnloadingRef]);

    // When the adapter changes, clear the `autoConnect` tracking flag
    const didAttemptAutoConnectRef = useRef(false);
    useEffect(() => {
        return () => {
            didAttemptAutoConnectRef.current = false;
        };
    }, [adapter]);

    // If auto-connect is enabled, request to connect when the adapter changes and is ready
    useEffect(() => {
        if (
            didAttemptAutoConnectRef.current ||
            isConnectingRef.current ||
            connected ||
            !onAutoConnectRequest ||
            !(wallet?.readyState === WalletReadyState.Installed || wallet?.readyState === WalletReadyState.Loadable)
        )
            return;

        isConnectingRef.current = true;
        setConnecting(true);
        didAttemptAutoConnectRef.current = true;
        (async function () {
            try {
                await onAutoConnectRequest();
            } catch {
                onConnectError();
                // Drop the error. It will be caught by `handleError` anyway.
            } finally {
                setConnecting(false);
                isConnectingRef.current = false;
            }
        })();
    }, [connected, onAutoConnectRequest, onConnectError, wallet]);

    // Send a transaction using the provided connection
    const sendTransaction: WalletAdapterProps['sendTransaction'] = useCallback(
        async (transaction, connection, options) => {
            if (!adapter) throw handleErrorRef.current(new WalletNotSelectedError());
            if (!connected) throw handleErrorRef.current(new WalletNotConnectedError(), adapter);
            return await adapter.sendTransaction(transaction, connection, options);
        },
        [adapter, connected]
    );

    // Sign a transaction if the wallet supports it
    const signTransaction: SignerWalletAdapterProps['signTransaction'] | undefined = useMemo(
        () =>
            adapter && 'signTransaction' in adapter
                ? async (transaction) => {
                      if (!connected) throw handleErrorRef.current(new WalletNotConnectedError(), adapter);
                      return await adapter.signTransaction(transaction);
                  }
                : undefined,
        [adapter, connected]
    );

    // Sign multiple transactions if the wallet supports it
    const signAllTransactions: SignerWalletAdapterProps['signAllTransactions'] | undefined = useMemo(
        () =>
            adapter && 'signAllTransactions' in adapter
                ? async (transactions) => {
                      if (!connected) throw handleErrorRef.current(new WalletNotConnectedError(), adapter);
                      return await adapter.signAllTransactions(transactions);
                  }
                : undefined,
        [adapter, connected]
    );

    // Sign an arbitrary message if the wallet supports it
    const signMessage: MessageSignerWalletAdapterProps['signMessage'] | undefined = useMemo(
        () =>
            adapter && 'signMessage' in adapter
                ? async (message) => {
                      if (!connected) throw handleErrorRef.current(new WalletNotConnectedError(), adapter);
                      return await adapter.signMessage(message);
                  }
                : undefined,
        [adapter, connected]
    );

    // Sign in if the wallet supports it
    const signIn: SignInMessageSignerWalletAdapterProps['signIn'] | undefined = useMemo(
        () =>
            adapter && 'signIn' in adapter
                ? async (input) => {
                      return await adapter.signIn(input);
                  }
                : undefined,
        [adapter]
    );

    const handleConnect = useCallback(async () => {
        if (isConnectingRef.current || isDisconnectingRef.current || wallet?.adapter.connected) return;
        if (!wallet) throw handleErrorRef.current(new WalletNotSelectedError());
        const { adapter, readyState } = wallet;
        if (!(readyState === WalletReadyState.Installed || readyState === WalletReadyState.Loadable))
            throw handleErrorRef.current(new WalletNotReadyError(), adapter);
        isConnectingRef.current = true;
        setConnecting(true);
        try {
            await adapter.connect();
        } catch (e) {
            onConnectError();
            throw e;
        } finally {
            setConnecting(false);
            isConnectingRef.current = false;
        }
    }, [onConnectError, wallet]);

    const handleDisconnect = useCallback(async () => {
        if (isDisconnectingRef.current) return;
        if (!adapter) return;
        isDisconnectingRef.current = true;
        setDisconnecting(true);
        try {
            await adapter.disconnect();
        } finally {
            setDisconnecting(false);
            isDisconnectingRef.current = false;
        }
    }, [adapter]);

    return (
        <WalletContext.Provider
            value={{
                autoConnect: !!onAutoConnectRequest,
                wallets,
                wallet,
                publicKey,
                connected,
                connecting,
                disconnecting,
                select: onSelectWallet,
                connect: handleConnect,
                disconnect: handleDisconnect,
                sendTransaction,
                signTransaction,
                signAllTransactions,
                signMessage,
                signIn,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}
