import type {
    SolanaSignAndSendTransactionFeature,
    SolanaSignMessageFeature,
    SolanaSignTransactionFeature,
} from '@solana/wallet-standard-features';
import type { WalletWithFeatures } from '@wallet-standard/base';
import type { ConnectFeature, DisconnectFeature, EventsFeature } from '@wallet-standard/features';
import type { WalletAdapter } from './adapter.js';

export type WalletAdapterCompatibleStandardWallet = WalletWithFeatures<
    ConnectFeature &
        EventsFeature &
        (SolanaSignAndSendTransactionFeature | SolanaSignTransactionFeature) &
        (DisconnectFeature | SolanaSignMessageFeature | never)
>;

export type StandardWalletAdapter = WalletAdapter & {
    wallet: WalletAdapterCompatibleStandardWallet;
    standard: true;
};
