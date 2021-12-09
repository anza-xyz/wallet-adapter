import { SolletWalletAdapterConfig } from '@solana/wallet-adapter-sollet';
import { Wallet } from './types';
export declare const getSolletExtensionWallet: ({ provider, ...config }?: SolletWalletAdapterConfig) => Wallet;
