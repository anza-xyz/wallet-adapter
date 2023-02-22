import type { Transaction, TransactionVersion, VersionedTransaction } from '@solana/web3.js';

export type SupportedTransactionVersions = ReadonlySet<TransactionVersion> | null | undefined;

export type TransactionOrVersionedTransaction<S extends SupportedTransactionVersions> = S extends null | undefined
    ? Transaction
    : Transaction | VersionedTransaction;

export function isVersionedTransaction(
    transaction: Transaction | VersionedTransaction
): transaction is VersionedTransaction {
    return 'version' in transaction;
}
