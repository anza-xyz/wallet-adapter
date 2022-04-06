import React, { FC, ReactNode, useState } from 'react';
import { WalletModalContext } from './useWalletModal';
import { WalletModal, WalletModalProps } from './WalletModal';

export interface WalletModalProviderProps extends WalletModalProps {
    children: ReactNode;
    fractalClick?: () => void;
}

export const WalletModalProvider: FC<WalletModalProviderProps> = ({ children, fractalClick, ...props }) => {
    const [visible, setVisible] = useState(false);

    return (
        <WalletModalContext.Provider
            value={{
                visible,
                setVisible,
                fractalClick,
            }}
        >
            {children}
            {visible && <WalletModal {...props} />}
        </WalletModalContext.Provider>
    );
};
