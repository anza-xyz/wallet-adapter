import {
    Adapter,
    MessageSignerWalletAdapterProps,
    SignerWalletAdapterProps,
    Wallet,
    WalletAdapterProps,
    WalletName,
    WalletReadyState,
} from '@solana/wallet-adapter-base';
import { createContext, useContext } from 'react';

export interface WalletWithReadyState extends Wallet {
    readyState: WalletReadyState;
}

export interface WalletContextState extends Omit<WalletAdapterProps, 'readyState'> {
    wallets: WalletWithReadyState[];
    autoConnect: boolean;
    wallet: WalletWithReadyState | null;
    adapter: Adapter | null;
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
