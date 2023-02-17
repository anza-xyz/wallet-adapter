import type {
    SolanaSignAndSendTransactionFeature,
    SolanaSignMessageFeature,
    SolanaSignTransactionFeature,
} from '@solana/wallet-standard-features';
import type { Wallet as StandardWallet, WalletWithFeatures as StandardWalletWithFeatures } from '@wallet-standard/base';
import type { ConnectFeature, DisconnectFeature, EventsFeature } from '@wallet-standard/features';
import type { WalletAdapter, WalletAdapterProps } from './adapter.js';

export type WalletAdapterCompatibleStandardWallet = StandardWalletWithFeatures<
    ConnectFeature &
        EventsFeature &
        (SolanaSignAndSendTransactionFeature | SolanaSignTransactionFeature) &
        (DisconnectFeature | SolanaSignMessageFeature | never)
>;

export interface StandardWalletAdapterProps<Name extends string = string> extends WalletAdapterProps<Name> {
    wallet: WalletAdapterCompatibleStandardWallet;
    standard: true;
}

export type StandardWalletAdapter<Name extends string = string> = WalletAdapter<Name> &
    StandardWalletAdapterProps<Name>;

export function isWalletAdapterCompatibleStandardWallet(
    wallet: StandardWallet
): wallet is WalletAdapterCompatibleStandardWallet {
    return (
        'standard:connect' in wallet.features &&
        'standard:events' in wallet.features &&
        ('solana:signAndSendTransaction' in wallet.features || 'solana:signTransaction' in wallet.features)
    );
}
