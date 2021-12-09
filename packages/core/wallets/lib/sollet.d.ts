import { SolletWalletAdapterConfig } from '@solana/wallet-adapter-sollet';
import { Wallet } from './types';
export declare const getSolletWallet: ({ provider, ...config }?: SolletWalletAdapterConfig) => Wallet;
