import type { WalletAdapter } from './adapter.js';
import type { MessageSignerWalletAdapter, SignerWalletAdapter } from './signer.js';

export type Adapter = WalletAdapter | SignerWalletAdapter | MessageSignerWalletAdapter;

export enum WalletAdapterNetwork {
    Mainnet = 'mainnet-beta',
    Testnet = 'testnet',
    Devnet = 'devnet',
}
