import { WalletAdapter } from './adapter';
import { MessageSignerWalletAdapter, SignerWalletAdapter } from './signer';

// https://medium.com/@KevinBGreene/surviving-the-typescript-ecosystem-branding-and-type-tagging-6cf6e516523d
type Brand<T, B> = T & { __brand__: B };

// WalletName is a nominal type that wallet adapters should use, e.g. `'MyCryptoWallet' as WalletName`
export type WalletName = Brand<string, 'WalletName'>;

export type Adapter = WalletAdapter | SignerWalletAdapter | MessageSignerWalletAdapter;

export interface Wallet {
    name: WalletName;
    url: string;
    icon: string;
    adapter: Adapter;
}
