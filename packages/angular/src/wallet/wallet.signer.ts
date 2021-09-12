import { MessageSignerWalletAdapter, SignerWalletAdapter, WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { Transaction } from '@solana/web3.js';
import { defer, from, Observable, Subject, throwError } from 'rxjs';

export const messageSigner = (
    adapter: MessageSignerWalletAdapter,
    connected: boolean,
    errorSubject: Subject<unknown>
): ((message: Uint8Array) => Observable<Uint8Array>) => {
    return (message: Uint8Array) => {
        if (!connected) {
            const error = new WalletNotConnectedError();
            errorSubject.next(error);
            return throwError(error);
        }

        return from(defer(() => adapter.signMessage(message)));
    };
};

export const transactionSigner = (
    adapter: SignerWalletAdapter,
    connected: boolean,
    errorSubject: Subject<unknown>
): ((transaction: Transaction) => Observable<Transaction>) => {
    return (transaction: Transaction) => {
        if (!connected) {
            const error = new WalletNotConnectedError();
            errorSubject.next(error);
            return throwError(error);
        }

        return from(defer(() => adapter.signTransaction(transaction)));
    };
};

export const transactionsSigner = (
    adapter: SignerWalletAdapter,
    connected: boolean,
    errorSubject: Subject<unknown>
): ((transactions: Transaction[]) => Observable<Transaction[]>) => {
    return (transactions: Transaction[]) => {
        if (!connected) {
            const error = new WalletNotConnectedError();
            errorSubject.next(error);
            return throwError(error);
        }

        return from(defer(() => adapter.signAllTransactions(transactions)));
    };
};
