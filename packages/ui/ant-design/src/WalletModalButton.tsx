import type { ButtonProps } from 'antd';
import type { FC, MouseEventHandler } from 'react';
import React, { useCallback } from 'react';
import { BaseWalletConnectionButton } from './BaseWalletConnectionButton.js';
import { useWalletModal } from './useWalletModal.js';

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
        <BaseWalletConnectionButton {...props} onClick={handleClick}>
            {children}
        </BaseWalletConnectionButton>
    );
};
