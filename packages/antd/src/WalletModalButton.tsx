import { Button, ButtonProps } from 'antd';
import React, { FC, MouseEventHandler, useCallback } from 'react';
import { useWalletModal } from './useWalletModal';

export const WalletModalButton: FC<ButtonProps> = ({ children = 'Select Wallet', onClick, ...props }) => {
    const { setVisible } = useWalletModal();

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        (event) => {
            if (onClick) onClick(event);
            if (!event.defaultPrevented) setVisible(true);
        },
        [onClick, setVisible]
    );

    return (
        <Button onClick={handleClick} {...props}>
            {children}
        </Button>
    );
};
