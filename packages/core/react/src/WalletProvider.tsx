import {
    createDefaultAddressSelector,
    createDefaultAuthorizationResultCache,
    createDefaultWalletNotFoundHandler,
    SolanaMobileWalletAdapter,
    SolanaMobileWalletAdapterWalletName,
} from '@solana-mobile/wallet-adapter-mobile';
import type { Adapter, WalletError, WalletName } from '@solana/wallet-adapter-base';
import { useStandardWalletAdapters } from '@solana/wallet-standard-wallet-adapter-react';
import type { ReactNode } from 'react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import getInferredClusterFromEndpoint from './getInferredClusterFromEndpoint.js';
import getEnvironment, { Environment } from './getEnvironment.js';
import { useConnection } from './useConnection.js';
import { useLocalStorage } from './useLocalStorage.js';
import { WalletProviderBase } from './WalletProviderBase.js';

export interface WalletProviderProps {
    children: ReactNode;
    wallets: Adapter[];
    autoConnect?: boolean;
    onError?: (error: WalletError) => void;
    localStorageKey?: string;
}

let _userAgent: string | null;
function getUserAgent() {
    if (_userAgent === undefined) {
        _userAgent = globalThis.navigator?.userAgent ?? null;
    }
    return _userAgent;
}

function getIsMobile(adapters: Adapter[]) {
    const userAgentString = getUserAgent();
    return getEnvironment({ adapters, userAgentString }) === Environment.MOBILE_WEB;
}

function getUriForAppIdentity() {
    const location = globalThis.location;
    if (location == null) {
        return;
    }
    return `${location.protocol}//${location.host}`;
}

export function WalletProvider({
    autoConnect,
    localStorageKey = 'walletName',
    wallets: adapters,
    ...props
}: WalletProviderProps) {
    const { connection } = useConnection();
    const adaptersWithStandardAdapters = useStandardWalletAdapters(adapters);
    const mobileWalletAdapter = useMemo(() => {
        if (!getIsMobile(adaptersWithStandardAdapters)) {
            return null;
        }
        const existingMobileWalletAdapter = adaptersWithStandardAdapters.find(
            (adapter) => adapter.name === SolanaMobileWalletAdapterWalletName
        );
        if (existingMobileWalletAdapter) {
            return existingMobileWalletAdapter;
        }
        return new SolanaMobileWalletAdapter({
            addressSelector: createDefaultAddressSelector(),
            appIdentity: {
                uri: getUriForAppIdentity(),
            },
            authorizationResultCache: createDefaultAuthorizationResultCache(),
            cluster: getInferredClusterFromEndpoint(connection?.rpcEndpoint),
            onWalletNotFound: createDefaultWalletNotFoundHandler(),
        });
    }, [adaptersWithStandardAdapters, connection?.rpcEndpoint]);
    const adaptersWithMobileWalletAdapter = useMemo(() => {
        if (mobileWalletAdapter == null || adaptersWithStandardAdapters.indexOf(mobileWalletAdapter) !== -1) {
            return adaptersWithStandardAdapters;
        }
        return [mobileWalletAdapter, ...adaptersWithStandardAdapters];
    }, [adaptersWithStandardAdapters, mobileWalletAdapter]);
    const [walletName, setWalletName] = useLocalStorage<WalletName | null>(
        localStorageKey,
        getIsMobile(adaptersWithStandardAdapters) ? SolanaMobileWalletAdapterWalletName : null
    );
    const adapter = useMemo(
        () => adaptersWithMobileWalletAdapter.find((a) => a.name === walletName) ?? null,
        [adaptersWithMobileWalletAdapter, walletName]
    );
    useEffect(() => {
        if (adapter == null) {
            return;
        }
        function handleDisconnect() {
            if (isUnloading.current) {
                return;
            }
            if (walletName === SolanaMobileWalletAdapterWalletName && getIsMobile(adaptersWithStandardAdapters)) {
                // Leave the adapter selected in the event of a disconnection.
                return;
            }
            setWalletName(null);
        }
        adapter.on('disconnect', handleDisconnect);
        return () => {
            adapter.off('disconnect', handleDisconnect);
        };
    }, [adapter, adaptersWithStandardAdapters, setWalletName, walletName]);
    const handleAutoConnectRequest = useMemo(() => {
        if (autoConnect !== true || !adapter) {
            return;
        }
        if (walletName === SolanaMobileWalletAdapterWalletName && getIsMobile(adaptersWithStandardAdapters)) {
            return (adapter as SolanaMobileWalletAdapter).autoConnect_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.bind(adapter);
        } else {
            return adapter.connect.bind(adapter);
        }
    }, [adapter, adaptersWithStandardAdapters, autoConnect, walletName]);
    useEffect(() => {
        if (adapter == null) {
            return;
        }
        return () => {
            if (
                // Selecting a wallet other than the mobile wallet adapter is not
                // sufficient reason to call `disconnect` on the mobile wallet adapter.
                // Calling `disconnect` on the mobile wallet adapter causes the entire
                // authorization store to be wiped.
                adapter.name !== SolanaMobileWalletAdapterWalletName
            ) {
                adapter.disconnect();
            }
        };
    }, [adapter]);
    const isUnloading = useRef(false);
    useEffect(() => {
        if (walletName === SolanaMobileWalletAdapterWalletName && getIsMobile(adaptersWithStandardAdapters)) {
            isUnloading.current = false;
            return;
        }
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
    }, [adaptersWithStandardAdapters, walletName]);
    const handleConnectError = useCallback(() => {
        if (adapter && adapter.name !== SolanaMobileWalletAdapterWalletName) {
            // If any error happens while connecting, unset the adapter.
            setWalletName(null);
        }
    }, [adapter, setWalletName]);
    return (
        <WalletProviderBase
            {...props}
            adapter={adapter}
            isUnloadingRef={isUnloading}
            onAutoConnectRequest={handleAutoConnectRequest}
            onConnectError={handleConnectError}
            onSelectWallet={setWalletName}
            wallets={adaptersWithMobileWalletAdapter}
        />
    );
}
