import type { PublicKey, Transaction } from '@solana/web3.js';
import { useMemo } from 'react';
import { useWallet } from './useWallet.js';

export interface AnchorWallet {
    publicKey: PublicKey;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}

export function useAnchorWallet(): AnchorWallet | undefined {
    const { publicKey, signTransaction, signAllTransactions } = useWallet();
    return useMemo(
        () =>
            publicKey && signTransaction && signAllTransactions
                ? {
                      publicKey,
                      signTransaction: signTransaction as (transaction: Transaction) => Promise<Transaction>,
                      signAllTransactions: signAllTransactions as (
                          transactions: Transaction[]
                      ) => Promise<Transaction[]>,
                  }
                : undefined,
        [publicKey, signTransaction, signAllTransactions]
    );
}
