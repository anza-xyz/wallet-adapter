import React, { FC, ReactNode, useState } from 'react';
import { WalletDialogContext } from './useWalletDialog';
import { WalletDialog, WalletDialogProps } from './WalletDialog';

export interface WalletDialogProviderProps extends WalletDialogProps {
    children: ReactNode;
}

export const WalletDialogProvider: FC<WalletDialogProviderProps> = ({ children, ...props }) => {
    const [open, setOpen] = useState(false);

    return (
        <WalletDialogContext.Provider
            value={{
                open,
                setOpen,
            }}
        >
            {children}
            <WalletDialog {...props} />
        </WalletDialogContext.Provider>
    );
};
