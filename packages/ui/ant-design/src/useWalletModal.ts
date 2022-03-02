import { createContext, useContext } from 'react';
import { defaultValueForModalProvider } from '@solana/wallet-adapter-react';

export interface WalletModalContextState {
    visible: boolean;
    setVisible: (open: boolean) => void;
}

const DEFAULT_CONTEXT = defaultValueForModalProvider('setVisible', 'visible', 'WalletModalContext', 'WalletModalProvider');

export const WalletModalContext = createContext<WalletModalContextState>(DEFAULT_CONTEXT as WalletModalContextState);

export function useWalletModal(): WalletModalContextState {
    return useContext(WalletModalContext);
}
