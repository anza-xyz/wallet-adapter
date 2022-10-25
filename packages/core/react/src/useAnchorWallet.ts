import type { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { useMemo } from 'react';
import { useWallet } from './useWallet.js';

export interface AnchorWallet {
    publicKey: PublicKey;
    signTransaction(transaction: Transaction | VersionedTransaction): Promise<Transaction | VersionedTransaction>;
    signAllTransactions(transactions: (Transaction | VersionedTransaction)[]): Promise<(Transaction | VersionedTransaction)[]>;
}

export function useAnchorWallet(): AnchorWallet | undefined {
    const { publicKey, signTransaction, signAllTransactions } = useWallet();
    return useMemo(
        () =>
            publicKey && signTransaction && signAllTransactions
                ? { publicKey, signTransaction, signAllTransactions }
                : undefined,
        [publicKey, signTransaction, signAllTransactions]
    );
}
