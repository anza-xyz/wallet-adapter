import { PublicKey, Transaction } from '@solana/web3.js';
import { useMemo } from 'react';
import { useWallet } from './useWallet';

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
                ? { publicKey, signTransaction, signAllTransactions }
                : undefined,
        [publicKey, signTransaction, signAllTransactions]
    );
}
