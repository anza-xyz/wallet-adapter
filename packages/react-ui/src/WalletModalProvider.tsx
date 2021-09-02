import React, { FC, useState } from 'react';
import './styles.css';
import { WalletModalContext } from './useWalletModal';
import { WalletModal, WalletModalProps } from './WalletModal';

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
