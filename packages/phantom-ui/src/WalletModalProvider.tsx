import React, { FC, ReactNode, useState } from 'react';
import { WalletModal } from './WalletModal';
import { WalletModalContext } from './useWalletModal';

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
            {/* <WalletModal /> */}
        </WalletModalContext.Provider>
    );
};
