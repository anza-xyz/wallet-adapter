import { useDisclosure } from '@chakra-ui/react';
import type { FC, ReactNode } from 'react';
import React from 'react';
import { WalletDialogContext } from './useWalletDialog.js';
import { WalletDialog, type WalletDialogProps } from './WalletDialog.js';

export interface WalletDialogProviderProps extends WalletDialogProps {
    children: ReactNode;
}

export const WalletDialogProvider: FC<WalletDialogProviderProps> = ({ children, ...props }) => {
    const { isOpen, onClose, onOpen } = useDisclosure();

    return (
        <WalletDialogContext.Provider
            value={{
                isOpen,
                onClose,
                onOpen,
            }}
        >
            {children}
            <WalletDialog {...props} />
        </WalletDialogContext.Provider>
    );
};
