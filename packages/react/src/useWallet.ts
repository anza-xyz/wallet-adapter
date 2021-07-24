import { PublicKey, Transaction } from '@solana/web3.js';
import { createContext, useContext } from 'react';
import { Wallet, WalletName } from './wallet';

export interface WalletContextState {
    wallets: Wallet[];
    autoConnect: boolean;

    wallet: Wallet | undefined;
    select: (walletName: WalletName) => void;

    publicKey: PublicKey | null;
    ready: boolean;
    connecting: boolean;
    disconnecting: boolean;
    connected: boolean;
    autoApprove: boolean;

    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    signTransaction: (transaction: Transaction) => Promise<Transaction>;
    signAllTransactions: (transaction: Transaction[]) => Promise<Transaction[]>;
}

export const WalletContext = createContext<WalletContextState>({} as WalletContextState);

export function useWallet(): WalletContextState {
    return useContext(WalletContext);
}
