import { WalletReadyState } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import React, { FC, ReactNode, useLayoutEffect, useState } from 'react';
import { WalletModalContext } from './useWalletModal';
import { WalletModal, WalletModalProps } from './WalletModal';
import { WalletModalAlt } from './WalletModalAlt';

export interface WalletModalProviderProps extends WalletModalProps {
    children: ReactNode;
}

export const WalletModalProvider: FC<WalletModalProviderProps> = ({ children, ...props }) => {
    const [visible, setVisible] = useState(false);
    const { wallets } = useWallet();
    const [anyWalletDetected, setAnyWalletDetected] = useState(false);

    useLayoutEffect(() => {
        setAnyWalletDetected(wallets.some((wallet) => wallet.readyState === WalletReadyState.Installed));
    }, [wallets]);

    return (
        <WalletModalContext.Provider
            value={{
                visible,
                setVisible,
            }}
        >
            {children}
            {visible && anyWalletDetected && <WalletModal {...props} />}
            {visible && !anyWalletDetected && <WalletModalAlt {...props} />}
        </WalletModalContext.Provider>
    );
};
