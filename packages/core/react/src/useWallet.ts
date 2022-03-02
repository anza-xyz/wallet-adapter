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

const DEFAULT_CONTEXT = {
    autoConnect: false,
    wallets: [],
    wallet: null,
    publicKey: null,
    connecting: false,
    connected: false,
    disconnecting: false,
    select(_name: WalletName) {
        console.error(
            'You have tried to call `select` on a `WalletContext` ' +
                'without providing one. Make sure to render a ' +
                '`<WalletProvider>` as an ancestor of the component ' +
                'that uses `WalletContext`.' 
        );
    },
    connect() {
        return Promise.reject(
            console.error(
                'You have tried to call `connect` on a `WalletContext` ' +
                    'without providing one. Make sure to render a ' +
                    '`<WalletProvider>` as an ancestor of the component ' +
                    'that uses `WalletContext`.' 
            )
        )
    },
    disconnect() {
        return Promise.reject(
            console.error(
                'You have tried to call `disconnect` on a `WalletContext` ' +
                    'without providing one. Make sure to render a ' +
                    '`<WalletProvider>` as an ancestor of the component ' +
                    'that uses `WalletContext`.' 
            )
        )
    },
    sendTransaction(
        _transaction: Transaction, _connection: Connection, _options?: SendTransactionOptions
    ) {
        return Promise.reject(
            console.error(
                'You have tried to call `sendTransaction` on a `WalletContext` ' +
                    'without providing one. Make sure to render a ' +
                    '`<WalletProvider>` as an ancestor of the component ' +
                    'that uses `WalletContext`.' 
            )
        )
    },
    signTransaction(_transaction: Transaction) {
        return Promise.reject(
            console.error(
                'You have tried to call `signTransaction` on a `WalletContext` ' +
                    'without providing one. Make sure to render a ' +
                    '`<WalletProvider>` as an ancestor of the component ' +
                    'that uses `WalletContext`.' 
            )
        )
    },
    signAllTransactions(_transaction: Transaction[]) {
        return Promise.reject(
            console.error(
                'You have tried to call `signAllTransactions` on a `WalletContext` ' +
                    'without providing one. Make sure to render a ' +
                    '`<WalletProvider>` as an ancestor of the component ' +
                    'that uses `WalletContext`.' 
            )
        )
    },
    signMessage(_message: Uint8Array) {
        return Promise.reject(
            console.error(
                'You have tried to call `signMessage` on a `WalletContext` ' +
                    'without providing one. Make sure to render a ' +
                    '`<WalletProvider>` as an ancestor of the component ' +
                    'that uses `WalletContext`.' 
            )
        )
    }
};
Object.defineProperty(DEFAULT_CONTEXT, 'wallets', {
    get() {
        console.error(
            'You have tried to read `wallets` on a `WalletContext` ' +
                'without providing one. Make sure to render a ' +
                '`<WalletProvider>` as an ancestor of the component ' +
                'that uses `WalletContext`.' 
        );
        return false;
    }
});
Object.defineProperty(DEFAULT_CONTEXT, 'wallet', {
    get() {
        console.error(
            'You have tried to read `wallet` on a `WalletContext` ' +
                'without providing one. Make sure to render a ' +
                '`<WalletProvider>` as an ancestor of the component ' +
                'that uses `WalletContext`.' 
        );
        return false
    }
});
Object.defineProperty(DEFAULT_CONTEXT, 'publicKey', {
    get() {
        console.error(
            'You have tried to read `publicKey` on a `WalletContext` ' +
                'without providing one. Make sure to render a ' +
                '`<WalletProvider>` as an ancestor of the component ' +
                'that uses `WalletContext`.' 
        );
        return false
    }
})

export const WalletContext = createContext<WalletContextState>(DEFAULT_CONTEXT as WalletContextState);

export function useWallet(): WalletContextState {
    return useContext(WalletContext);
}
