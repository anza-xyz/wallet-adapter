import React, { FC, useState } from 'react';
import { WalletDialogContext } from './useWalletDialog';
import { WalletDialog, WalletDialogProps } from './WalletDialog';

export const WalletDialogProvider: FC<WalletDialogProps> = ({ children, ...props }) => {
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
