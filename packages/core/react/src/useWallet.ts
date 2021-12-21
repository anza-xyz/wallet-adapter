import {
    Adapter,
    MessageSignerWalletAdapterProps,
    SignerWalletAdapterProps,
    Wallet,
    WalletAdapterProps,
    WalletName,
} from '@solana/wallet-adapter-base';
import { createContext, useContext } from 'react';

export interface EnhancedWallet extends Wallet {
    ready: boolean;
}

export interface WalletContextState extends Omit<WalletAdapterProps, 'ready'> {
    wallets: EnhancedWallet[];
    walletsByName: Record<WalletName, EnhancedWallet>;
    autoConnect: boolean;
    wallet: EnhancedWallet | null;
    adapter: Adapter | null;
    ready: boolean;
    disconnecting: boolean;

    select(walletName: WalletName): void;

    signTransaction: SignerWalletAdapterProps['signTransaction'] | undefined;
    signAllTransactions: SignerWalletAdapterProps['signAllTransactions'] | undefined;
    signMessage: MessageSignerWalletAdapterProps['signMessage'] | undefined;
}

export const WalletContext = createContext<WalletContextState>({} as WalletContextState);

export function useWallet(): WalletContextState {
    return useContext(WalletContext);
}
