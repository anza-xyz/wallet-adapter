import { createContext, useContext } from 'react';

export interface WalletModalContextState {
    visible: boolean;
    setVisible: (open: boolean) => void;
}

const DEFAULT_CONTEXT = {
    setVisible(_open: boolean) {
        console.error(
            'You have tried to call `setVisible` on a `WalletModalContext` ' +
                'without providing one. Make sure to render a ' +
                '`<WalletModalProvider>` as an ancestor of the component ' +
                'that uses `WalletModalContext`.' 
        );
    },
    visible: false,
};
Object.defineProperty(DEFAULT_CONTEXT, 'visible', {
    get() {
        console.error(
            'You have tried to read `visible` on a `WalletModalContext` ' + 
                'without providing one. Make sure to render a ' + 
                '`<WalletModalProvider>` as an ancestor of the component ' +
                'that uses `WalletModalContext`.'
        );
        return false;
    }
})

export const WalletModalContext = createContext<WalletModalContextState>(DEFAULT_CONTEXT as WalletModalContextState);

export function useWalletModal(): WalletModalContextState {
    return useContext(WalletModalContext);
}
