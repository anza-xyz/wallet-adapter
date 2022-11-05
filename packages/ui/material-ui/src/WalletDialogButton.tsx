import type { ButtonProps } from '@mui/material';
import { Button } from '@mui/material';
import type { FC, MouseEventHandler } from 'react';
import React, { useCallback } from 'react';
import { useWalletDialog } from './useWalletDialog.js';

export const WalletDialogButton: FC<ButtonProps> = ({
    children = 'Select Wallet',
    color = 'primary',
    variant = 'contained',
    type = 'button',
    onClick,
    ...props
}) => {
    const { setOpen } = useWalletDialog();

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        (event) => {
            if (onClick) onClick(event);
            if (!event.defaultPrevented) setOpen(true);
        },
        [onClick, setOpen]
    );

    return (
        <Button color={color} variant={variant} type={type} onClick={handleClick} {...props}>
            {children}
        </Button>
    );
};
