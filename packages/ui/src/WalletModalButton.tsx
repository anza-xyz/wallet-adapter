import { Button, ButtonProps } from './Button';
import React, { FC, MouseEventHandler, useCallback } from 'react';
import { useWalletModal } from './useWalletModal';

export const WalletModalButton: FC<ButtonProps> = ({
    children = 'Select Wallet',
    color = '#4E44CE',
    onClick,
    ...props
}) => {
    const { visible, setVisible } = useWalletModal();

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        (event) => {
            if (onClick) onClick(event);
            if (!event.defaultPrevented) setVisible(!visible);
        },
        [onClick, setVisible, visible]
    );

    return (
        <Button color={color} onClick={handleClick} {...props}>
            {children}
        </Button>
    );
};
