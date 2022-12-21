import type { ButtonProps } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import type { FC, MouseEventHandler } from 'react';
import React, { useCallback } from 'react';
import { useWalletDialog } from './useWalletDialog.js';

export const WalletDialogButton: FC<ButtonProps> = ({
    children = 'Select Wallet',
    type = 'button',
    onClick,
    ...props
}) => {
    const { onOpen } = useWalletDialog();

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        (event) => {
            if (onClick) onClick(event);
            onOpen();
        },
        [onClick, onOpen]
    );

    return (
        <Button type={type} onClick={handleClick} {...props}>
            {children}
        </Button>
    );
};
