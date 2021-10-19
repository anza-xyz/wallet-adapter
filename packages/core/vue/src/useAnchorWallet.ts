import { PublicKey, Transaction } from '@solana/web3.js';
import { computed, Ref } from '@vue/reactivity';
import { useWallet } from './useWallet';

export interface AnchorWallet {
    publicKey: PublicKey;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}

export function useAnchorWallet(): Ref<AnchorWallet | undefined> {
    const wallet = useWallet();

    return computed<AnchorWallet | undefined>(() => {
        // Ensure the wallet was initialised by a WalletProvider.
        if (! wallet) return;

        // Ensure the wallet is connect and supports the right methods.
        const { signTransaction, signAllTransactions, publicKey } = wallet;
        if (! signTransaction.value || ! signAllTransactions.value || ! publicKey.value) return;

        return {
            signTransaction: signTransaction.value,
            signAllTransactions: signAllTransactions.value,
            publicKey: publicKey.value,
        };
    })
}
