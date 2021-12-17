import {
    Adapter,
    MessageSignerWalletAdapterProps,
    SignerWalletAdapterProps,
    Wallet,
    WalletAdapterProps,
    WalletName,
} from '@solana/wallet-adapter-base';
import { createContext, useContext } from 'react';

export interface WalletDetails {
    ready: boolean;
}

export interface WalletContextState extends Omit<WalletAdapterProps, 'ready'> {
    wallets: Wallet[];
    details: Record<WalletName, WalletDetails>;
    autoConnect: boolean;

    wallet: Wallet | null;
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
