import React, { FC, ReactNode, useState } from 'react';
import { WalletDialogContext } from './useWalletDialog';
import { WalletDialog } from './WalletDialog';

export const WalletDialogProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(false);

    return (
        <WalletDialogContext.Provider
            value={{
                open,
                setOpen,
            }}
        >
            {children}
            <WalletDialog />
        </WalletDialogContext.Provider>
    );
};
