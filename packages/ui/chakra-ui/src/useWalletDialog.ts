import { createContext, useContext } from 'react';

export interface WalletDialogContextState {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const WalletDialogContext = createContext<WalletDialogContextState>({} as WalletDialogContextState);

export function useWalletDialog(): WalletDialogContextState {
    return useContext(WalletDialogContext);
}
