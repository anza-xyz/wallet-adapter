import type { FC, ReactNode } from 'react';
import React, { useState } from 'react';
import { WalletDialogContext } from './useWalletDialog.js';
import type { WalletDialogProps } from './WalletDialog.js';
import { WalletDialog } from './WalletDialog.js';

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
