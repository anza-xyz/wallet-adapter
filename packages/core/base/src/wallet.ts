import { WalletAdapter } from './adapter';
import { MessageSignerWalletAdapter, SignerWalletAdapter } from './signer';

export type WalletName = string & { __brand__: 'WalletName' };

export type Adapter = WalletAdapter | SignerWalletAdapter | MessageSignerWalletAdapter;

export interface Wallet {
    name: WalletName;
    url: string;
    icon: string;
    adapter: Adapter;
}
