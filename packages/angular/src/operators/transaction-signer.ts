import { SignerWalletAdapter, WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { Transaction } from '@solana/web3.js';
import { defer, from, Observable, throwError } from 'rxjs';

export const transactionSigner = (
    adapter: SignerWalletAdapter,
    connected: boolean
): ((transaction: Transaction) => Observable<Transaction>) => {
    return (transaction: Transaction) => {
        if (!connected) {
            return throwError(new WalletNotConnectedError());
        }

        return from(defer(() => adapter.signTransaction(transaction)));
    };
};
