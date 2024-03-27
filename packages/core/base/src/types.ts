import type { WalletAdapter } from './adapter.js';
import type { MessageSignerWalletAdapter, SignerWalletAdapter, SignInMessageSignerWalletAdapter } from './signer.js';
import type { StandardWalletAdapter } from './standard.js';

export type Adapter =
    | WalletAdapter
    | SignerWalletAdapter
    | MessageSignerWalletAdapter
    | SignInMessageSignerWalletAdapter
    | StandardWalletAdapter;

export enum WalletAdapterNetwork {
    Mainnet = 'mainnet-beta',
    Testnet = 'testnet',
    Devnet = 'devnet',
}
