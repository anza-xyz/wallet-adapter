import { SolletWalletAdapterConfig } from '@solana/wallet-adapter-sollet';
import { Wallet } from './types';
export declare const getSolflareWebWallet: ({ provider, ...config }?: SolletWalletAdapterConfig) => Wallet;
