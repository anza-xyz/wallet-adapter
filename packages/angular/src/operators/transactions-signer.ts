import { SignerWalletAdapter, WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { Transaction } from '@solana/web3.js';
import { defer, from, Observable, throwError } from 'rxjs';

export const transactionsSigner = (
    adapter: SignerWalletAdapter,
    connected: boolean
): ((transactions: Transaction[]) => Observable<Transaction[]>) => {
    return (transactions: Transaction[]) => {
        if (!connected) {
            return throwError(new WalletNotConnectedError());
        }

        return from(defer(() => adapter.signAllTransactions(transactions)));
    };
};
