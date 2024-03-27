import {
    type Adapter,
    type MessageSignerWalletAdapterProps,
    type SignerWalletAdapterProps,
    type SignInMessageSignerWalletAdapterProps,
    type WalletAdapterProps,
    type WalletName,
    type WalletReadyState,
} from '@solana/wallet-adapter-base';
import { type PublicKey } from '@solana/web3.js';
import { createContext, useContext } from 'react';

export interface Wallet {
    adapter: Adapter;
    readyState: WalletReadyState;
}

export interface WalletContextState {
    autoConnect: boolean;
    wallets: Wallet[];
    wallet: Wallet | null;
    publicKey: PublicKey | null;
    connecting: boolean;
    connected: boolean;
    disconnecting: boolean;

    select(walletName: WalletName | null): void;
    connect(): Promise<void>;
    disconnect(): Promise<void>;

    sendTransaction: WalletAdapterProps['sendTransaction'];
    signTransaction: SignerWalletAdapterProps['signTransaction'] | undefined;
    signAllTransactions: SignerWalletAdapterProps['signAllTransactions'] | undefined;
    signMessage: MessageSignerWalletAdapterProps['signMessage'] | undefined;
    signIn: SignInMessageSignerWalletAdapterProps['signIn'] | undefined;
}

const EMPTY_ARRAY: ReadonlyArray<never> = [];

const DEFAULT_CONTEXT: Partial<WalletContextState> = {
    autoConnect: false,
    connecting: false,
    connected: false,
    disconnecting: false,
    select() {
        logMissingProviderError('call', 'select');
    },
    connect() {
        return Promise.reject(logMissingProviderError('call', 'connect'));
    },
    disconnect() {
        return Promise.reject(logMissingProviderError('call', 'disconnect'));
    },
    sendTransaction() {
        return Promise.reject(logMissingProviderError('call', 'sendTransaction'));
    },
    signTransaction() {
        return Promise.reject(logMissingProviderError('call', 'signTransaction'));
    },
    signAllTransactions() {
        return Promise.reject(logMissingProviderError('call', 'signAllTransactions'));
    },
    signMessage() {
        return Promise.reject(logMissingProviderError('call', 'signMessage'));
    },
    signIn() {
        return Promise.reject(logMissingProviderError('call', 'signIn'));
    },
};
Object.defineProperty(DEFAULT_CONTEXT, 'wallets', {
    get() {
        logMissingProviderError('read', 'wallets');
        return EMPTY_ARRAY;
    },
});
Object.defineProperty(DEFAULT_CONTEXT, 'wallet', {
    get() {
        logMissingProviderError('read', 'wallet');
        return null;
    },
});
Object.defineProperty(DEFAULT_CONTEXT, 'publicKey', {
    get() {
        logMissingProviderError('read', 'publicKey');
        return null;
    },
});

function logMissingProviderError(action: string, property: string) {
    const error = new Error(
        `You have tried to ${action} "${property}" on a WalletContext without providing one. ` +
            'Make sure to render a WalletProvider as an ancestor of the component that uses WalletContext.'
    );
    console.error(error);
    return error;
}

export const WalletContext = createContext<WalletContextState>(DEFAULT_CONTEXT as WalletContextState);

export function useWallet(): WalletContextState {
    return useContext(WalletContext);
}
