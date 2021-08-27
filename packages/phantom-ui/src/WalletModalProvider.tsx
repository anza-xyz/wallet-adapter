import React, { FC, ReactNode, useState } from 'react';
import { WalletModal } from './WalletModal';
import { WalletModalContext } from './useWalletModal';

import './styles.css';

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
            {visible && <WalletModal />}
        </WalletModalContext.Provider>
    );
};
