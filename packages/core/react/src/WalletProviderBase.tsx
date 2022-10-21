import type {
    Adapter,
    MessageSignerWalletAdapterProps,
    SignerWalletAdapterProps,
    WalletAdapterProps,
    WalletError,
    WalletName,
} from '@solana/wallet-adapter-base';
import { WalletNotConnectedError, WalletNotReadyError, WalletReadyState } from '@solana/wallet-adapter-base';
import type { PublicKey } from '@solana/web3.js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WalletNotSelectedError } from './errors.js';
import { WalletContext } from './useWallet.js';
import type { WalletProviderProps } from './WalletProvider.js';

type Props = Readonly<
    Omit<WalletProviderProps, 'autoConnect' | 'localStorageKey'> & {
        adapter: Adapter | null;
        isUnloadingRef: React.RefObject<boolean>;
        // NOTE: The presence/absence of this handler implies that auto-connect is enabled/disabled.
        onAutoConnectRequest?: () => Promise<void>;
        onConnectError: () => void;
        onSelectWallet: (walletName: WalletName) => void;
    }
>;

export function WalletProviderBase({
    adapter,
    children,
    isUnloadingRef,
    onAutoConnectRequest,
    onConnectError,
    onError,
    onSelectWallet,
    wallets: adapters,
}: Props) {
    const isConnecting = useRef(false);
    const [connecting, setConnecting] = useState(false);
    const isDisconnecting = useRef(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [publicKey, setPublicKey] = useState(() => adapter?.publicKey ?? null);
    const [connected, setConnected] = useState(() => adapter?.connected ?? false);
    const handleError = useCallback(
        (error: WalletError) => {
            if (!isUnloadingRef.current) {
                (onError || console.error)(error);
            }
            return error;
        },
        [isUnloadingRef, onError]
    );

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
        function handleWalletConnectEvent(publicKey: PublicKey) {
            setPublicKey(publicKey);
            isConnecting.current = false;
            setConnecting(false);
            setConnected(true);
            isDisconnecting.current = false;
            setDisconnecting(false);
        }
        function handleWalletDisconnectEvent() {
            if (!isUnloadingRef.current) {
                isConnecting.current = false;
                setConnecting(false);
                setConnected(false);
                isDisconnecting.current = false;
                setDisconnecting(false);
                setPublicKey(null);
            }
        }
        if (adapter) {
            adapter.on('connect', handleWalletConnectEvent);
            adapter.on('disconnect', handleWalletDisconnectEvent);
            adapter.on('error', handleError);
            return () => {
                adapter.off('connect', handleWalletConnectEvent);
                adapter.off('disconnect', handleWalletDisconnectEvent);
                adapter.off('error', handleError);
                isConnecting.current = false;
                setConnecting(false);
                setConnected(false);
                isDisconnecting.current = false;
                setDisconnecting(false);
                setPublicKey(null);
            };
        }
    }, [adapter, handleError, isUnloadingRef]);

    // When the adapter changes, clear the `autoConnect` tracking flag
    const didAttemptAutoConnect = useRef(false);
    useEffect(() => {
        return () => {
            didAttemptAutoConnect.current = false;
        };
    }, [adapter]);

    // If auto-connect is enabled, request to connect when the adapter changes and is ready
    useEffect(() => {
        if (
            didAttemptAutoConnect.current ||
            isConnecting.current ||
            connected ||
            !onAutoConnectRequest ||
            !(wallet?.readyState === WalletReadyState.Installed || wallet?.readyState === WalletReadyState.Loadable)
        ) {
            return;
        }
        isConnecting.current = true;
        setConnecting(true);
        didAttemptAutoConnect.current = true;
        (async function () {
            try {
                await onAutoConnectRequest();
            } catch {
                onConnectError();
                // Drop the error. It will be caught by `handleError` anyway.
            } finally {
                setConnecting(false);
                isConnecting.current = false;
            }
        })();
    }, [connected, onAutoConnectRequest, onConnectError, wallet]);

    // Send a transaction using the provided connection
    const sendTransaction: WalletAdapterProps['sendTransaction'] = useCallback(
        async (transaction, connection, options) => {
            if (!adapter) throw handleError(new WalletNotSelectedError());
            if (!connected) throw handleError(new WalletNotConnectedError());
            return await adapter.sendTransaction(transaction, connection, options);
        },
        [adapter, handleError, connected]
    );

    // Sign a transaction if the wallet supports it
    const signTransaction: SignerWalletAdapterProps['signTransaction'] | undefined = useMemo(
        () =>
            adapter && 'signTransaction' in adapter
                ? async (transaction) => {
                      if (!connected) throw handleError(new WalletNotConnectedError());
                      return await adapter.signTransaction(transaction);
                  }
                : undefined,
        [adapter, handleError, connected]
    );

    // Sign multiple transactions if the wallet supports it
    const signAllTransactions: SignerWalletAdapterProps['signAllTransactions'] | undefined = useMemo(
        () =>
            adapter && 'signAllTransactions' in adapter
                ? async (transactions) => {
                      if (!connected) throw handleError(new WalletNotConnectedError());
                      return await adapter.signAllTransactions(transactions);
                  }
                : undefined,
        [adapter, handleError, connected]
    );

    // Sign an arbitrary message if the wallet supports it
    const signMessage: MessageSignerWalletAdapterProps['signMessage'] | undefined = useMemo(
        () =>
            adapter && 'signMessage' in adapter
                ? async (message) => {
                      if (!connected) throw handleError(new WalletNotConnectedError());
                      return await adapter.signMessage(message);
                  }
                : undefined,
        [adapter, handleError, connected]
    );

    const handleConnect = useCallback(async () => {
        if (isConnecting.current || isDisconnecting.current || wallet?.adapter.connected) return;
        if (!wallet) throw handleError(new WalletNotSelectedError());
        const { adapter, readyState } = wallet;
        if (!(readyState === WalletReadyState.Installed || readyState === WalletReadyState.Loadable)) {
            if (typeof window !== 'undefined') {
                window.open(adapter.url, '_blank');
            }
            throw handleError(new WalletNotReadyError());
        }
        isConnecting.current = true;
        setConnecting(true);
        try {
            await adapter.connect();
        } catch (e) {
            onConnectError();
            throw e;
        } finally {
            setConnecting(false);
            isConnecting.current = false;
        }
    }, [handleError, onConnectError, wallet]);

    const handleDisconnect = useCallback(async () => {
        if (isDisconnecting.current) return;
        if (!adapter) return;
        isDisconnecting.current = true;
        setDisconnecting(true);
        try {
            await adapter.disconnect();
        } finally {
            setDisconnecting(false);
            isDisconnecting.current = false;
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
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}
