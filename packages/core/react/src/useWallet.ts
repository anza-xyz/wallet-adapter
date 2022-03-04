import {
    Adapter,
    MessageSignerWalletAdapterProps,
    SendTransactionOptions,
    SignerWalletAdapterProps,
    WalletName,
    WalletReadyState,
} from '@solana/wallet-adapter-base';
import { Connection, PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';
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

    select(walletName: WalletName): void;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options?: SendTransactionOptions
    ): Promise<TransactionSignature>;

    signTransaction: SignerWalletAdapterProps['signTransaction'] | undefined;
    signAllTransactions: SignerWalletAdapterProps['signAllTransactions'] | undefined;
    signMessage: MessageSignerWalletAdapterProps['signMessage'] | undefined;
}

const EMPTY_ARRAY: ReadonlyArray<never> = [];

const DEFAULT_CONTEXT = {
    autoConnect: false,
    connecting: false,
    connected: false,
    disconnecting: false,
    select(_name: WalletName) {
        console.error(constructMissingProviderErrorMessage('get', 'select'));
    },
    connect() {
        return Promise.reject(console.error(constructMissingProviderErrorMessage('get', 'connect')));
    },
    disconnect() {
        return Promise.reject(console.error(constructMissingProviderErrorMessage('get', 'disconnect')));
    },
    sendTransaction(_transaction: Transaction, _connection: Connection, _options?: SendTransactionOptions) {
        return Promise.reject(console.error(constructMissingProviderErrorMessage('get', 'sendTransaction')));
    },
    signTransaction(_transaction: Transaction) {
        return Promise.reject(console.error(constructMissingProviderErrorMessage('get', 'signTransaction')));
    },
    signAllTransactions(_transaction: Transaction[]) {
        return Promise.reject(console.error(constructMissingProviderErrorMessage('get', 'signAllTransactions')));
    },
    signMessage(_message: Uint8Array) {
        return Promise.reject(console.error(constructMissingProviderErrorMessage('get', 'signMessage')));
    },
} as WalletContextState;
Object.defineProperty(DEFAULT_CONTEXT, 'wallets', {
    get() {
        console.error(constructMissingProviderErrorMessage('read', 'wallets'));
        return EMPTY_ARRAY;
    },
});
Object.defineProperty(DEFAULT_CONTEXT, 'wallet', {
    get() {
        console.error(constructMissingProviderErrorMessage('read', 'wallet'));
        return null;
    },
});
Object.defineProperty(DEFAULT_CONTEXT, 'publicKey', {
    get() {
        console.error(constructMissingProviderErrorMessage('read', 'publicKey'));
        return null;
    },
});

function constructMissingProviderErrorMessage(action: string, valueName: string) {
    return (
        'You have tried to ' +
        ` ${action} "${valueName}"` +
        ' on a WalletContext without providing one.' +
        ' Make sure to render a WalletProvider' +
        ' as an ancestor of the component that uses ' +
        'WalletContext'
    );
}

export const WalletContext = createContext<WalletContextState>(DEFAULT_CONTEXT as WalletContextState);

export function useWallet(): WalletContextState {
    return useContext(WalletContext);
}
