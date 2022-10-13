import type { Adapter, WalletError } from '@solana/wallet-adapter-base';
import React, { useEffect, useRef } from 'react';

import type { ReactNode } from 'react';
import type { WalletName } from '@solana/wallet-adapter-base';
import { WalletProviderBase } from './WalletProviderBase.js';
import { useLocalStorage } from './useLocalStorage.js';
import { useMemo } from 'react';

export interface WalletProviderProps {
    children: ReactNode;
    wallets: Adapter[];
    autoConnect?: boolean;
    onError?: (error: WalletError) => void;
    localStorageKey?: string;
}

export function WalletProvider({
    autoConnect,
    localStorageKey = 'walletName',
    wallets: adapters,
    ...props
}: WalletProviderProps) {
    const [walletName, setWalletName] = useLocalStorage<WalletName | null>(localStorageKey, null);
    const adapter = useMemo(() => adapters.find((a) => a.name === walletName) ?? null, [adapters, walletName]);
    useEffect(() => {
        if (adapter == null) {
            return;
        }
        function handleDisconnect() {
            if (isUnloading.current) {
                return;
            }
            setWalletName(null);
        }
        adapter.on('disconnect', handleDisconnect);
        return () => {
            adapter.off('disconnect', handleDisconnect);
        };
    }, [adapter, setWalletName, walletName]);
    const handleAutoConnectRequest = useMemo(() => {
        if (autoConnect !== true || !adapter) {
            return;
        }
        return adapter.connect.bind(adapter);
    }, [adapter, autoConnect]);
    useEffect(() => {
        if (adapter == null) {
            return;
        }
        return () => {
            adapter.disconnect();
        };
    }, [adapter]);
    const isUnloading = useRef(false);
    useEffect(() => {
        function handleBeforeUnload() {
            isUnloading.current = true;
        }
        /**
         * Some wallets fire disconnection events when the window unloads. Since there's no way to
         * distinguish between a disconnection event received because a user initiated it, and one
         * that was received because they've closed the window, we have to track window unload
         * events themselves. Downstream components use this information to decide whether to act
         * upon or drop wallet events and errors.
         */
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
    return (
        <WalletProviderBase
            {...props}
            adapter={adapter}
            isUnloadingRef={isUnloading}
            key={adapter?.name}
            onAutoConnectRequest={handleAutoConnectRequest}
            onSelectWallet={setWalletName}
            wallets={adapters}
        />
    );
}
