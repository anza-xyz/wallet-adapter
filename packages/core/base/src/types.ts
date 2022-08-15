import type { WalletAdapter } from './adapter';
import type { MessageSignerWalletAdapter, SignerWalletAdapter } from './signer';

export type Adapter = WalletAdapter | SignerWalletAdapter | MessageSignerWalletAdapter;

export enum WalletAdapterNetwork {
    Mainnet = 'mainnet-beta',
    Testnet = 'testnet',
    Devnet = 'devnet',
}
