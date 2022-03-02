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
import { missingProviderErrorMessage } from './helpers';

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

const DEFAULT_CONTEXT = {
    autoConnect: false,
    wallets: [],
    wallet: null,
    publicKey: null,
    connecting: false,
    connected: false,
    disconnecting: false,
    select(_name: WalletName) {
        console.error(missingProviderErrorMessage("select", "WalletContext", "WalletProvider", "call"));
    },
    connect() {
        return Promise.reject(
            console.error(missingProviderErrorMessage("connect", "WalletContext", "WalletProvider", "call"))
        );
    },
    disconnect() {
        return Promise.reject(
            console.error(missingProviderErrorMessage("disconnect", "WalletContext", "WalletProvider", "call"))
        )
    },
    sendTransaction(
        _transaction: Transaction, _connection: Connection, _options?: SendTransactionOptions
    ) {
        return Promise.reject(
            console.error(missingProviderErrorMessage("sendTransaction", "WalletContext", "WalletProvider", "call"))
        )
    },
    signTransaction(_transaction: Transaction) {
        return Promise.reject(
            console.error(missingProviderErrorMessage("signTransaction", "WalletContext", "WalletProvider", "call"))
        )
    },
    signAllTransactions(_transaction: Transaction[]) {
        return Promise.reject(
            console.error(missingProviderErrorMessage("signAllTransactions", "WalletContext", "WalletProvider", "call"))
        )
    },
    signMessage(_message: Uint8Array) {
        return Promise.reject(
            console.error(missingProviderErrorMessage("signMessage", "WalletContext", "WalletProvider", "call"))
        )
    }
};
Object.defineProperty(DEFAULT_CONTEXT, 'wallets', {
    get() {
        console.error(missingProviderErrorMessage("wallets", "WalletContext", "WalletProvider", "read"));
        return false;
    }
});
Object.defineProperty(DEFAULT_CONTEXT, 'wallet', {
    get() {
        console.error(missingProviderErrorMessage("wallet", "WalletContext", "WalletProvider", "read"));
        return false
    }
});
Object.defineProperty(DEFAULT_CONTEXT, 'publicKey', {
    get() {
        console.error(missingProviderErrorMessage("publicKey", "WalletContext", "WalletProvider", "read"));
        return false
    }
})

export const WalletContext = createContext<WalletContextState>(DEFAULT_CONTEXT as WalletContextState);

export function useWallet(): WalletContextState {
    return useContext(WalletContext);
}
