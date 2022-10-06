import type { Transaction, TransactionVersion, VersionedTransaction } from '@solana/web3.js';
import type { WalletAdapter } from './adapter.js';
import type { MessageSignerWalletAdapter, SignerWalletAdapter } from './signer.js';

export type Adapter = WalletAdapter | SignerWalletAdapter | MessageSignerWalletAdapter;

export enum WalletAdapterNetwork {
    Mainnet = 'mainnet-beta',
    Testnet = 'testnet',
    Devnet = 'devnet',
}

export type SupportedTransactionVersions = ReadonlySet<TransactionVersion> | null | undefined;

export type TransactionOrVersionedTransaction<S extends SupportedTransactionVersions> = S extends null | undefined
    ? Transaction
    : Transaction | VersionedTransaction;
