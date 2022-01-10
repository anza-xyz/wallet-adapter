import {
    MessageSignerWalletAdapter,
    SignerWalletAdapter,
    WalletError,
    WalletNotConnectedError,
} from '@solana/wallet-adapter-base';
import { Transaction } from '@solana/web3.js';
import { defer, from, Observable, throwError } from 'rxjs';

export const signMessage = (
    adapter: MessageSignerWalletAdapter,
    connected: boolean,
    errorHandler: (error: WalletError) => unknown
): ((message: Uint8Array) => Observable<Uint8Array>) => {
    return (message: Uint8Array) => {
        if (!connected) {
            return throwError(errorHandler(new WalletNotConnectedError()));
        }

        return from(defer(() => adapter.signMessage(message)));
    };
};

export const signTransaction = (
    adapter: SignerWalletAdapter,
    connected: boolean,
    errorHandler: (error: WalletError) => unknown
): ((transaction: Transaction) => Observable<Transaction>) => {
    return (transaction: Transaction) => {
        if (!connected) {
            return throwError(errorHandler(new WalletNotConnectedError()));
        }

        return from(defer(() => adapter.signTransaction(transaction)));
    };
};

export const signAllTransactions = (
    adapter: SignerWalletAdapter,
    connected: boolean,
    errorHandler: (error: WalletError) => unknown
): ((transactions: Transaction[]) => Observable<Transaction[]>) => {
    return (transactions: Transaction[]) => {
        if (!connected) {
            return throwError(errorHandler(new WalletNotConnectedError()));
        }

        return from(defer(() => adapter.signAllTransactions(transactions)));
    };
};
