import React, { FC, ReactNode, useState } from 'react';
import { WalletModalContext } from './useWalletModal';
import { WalletModal } from './WalletModal';

export const WalletModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);

    return (
        <WalletModalContext.Provider
            value={{
                visible,
                setVisible,
            }}
        >
            {children}
            <WalletModal />
        </WalletModalContext.Provider>
    );
};
