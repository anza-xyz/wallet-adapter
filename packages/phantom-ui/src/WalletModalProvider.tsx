import React, { FC, useState } from 'react';
import { WalletModal, WalletModalProps } from './WalletModal';
import { WalletModalContext } from './useWalletModal';

import './styles.css';

export const WalletModalProvider: FC<WalletModalProps> = ({ children, ...props }) => {
    const [visible, setVisible] = useState(false);

    return (
        <WalletModalContext.Provider
            value={{
                visible,
                setVisible,
            }}
        >
            {children}
            {visible && <WalletModal {...props} />}
        </WalletModalContext.Provider>
    );
};
