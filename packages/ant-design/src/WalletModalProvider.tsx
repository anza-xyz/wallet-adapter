import React, { FC, ReactNode, useState } from 'react';
import { WalletModalContext } from './useWalletModal';
import { WalletModal } from './WalletModal';

export const WalletModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(false);

    return (
        <WalletModalContext.Provider
            value={{
                visible: open,
                setVisible: setOpen,
            }}
        >
            {children}
            <WalletModal />
        </WalletModalContext.Provider>
    );
};
