import type { ButtonProps } from '@mui/material';

import { useWalletConnectButton } from '@solana/wallet-adapter-base-ui';
import React from 'react';
import { BaseWalletConnectionButton } from './BaseWalletConnectionButton.js';

type Props = ButtonProps & {
    labels: { [TButtonState in ReturnType<typeof useWalletConnectButton>['buttonState']]: string };
};

export function BaseWalletConnectButton({ children, disabled, labels, onClick, ...props }: Props) {
    const { buttonDisabled, buttonState, onButtonClick, walletIcon, walletName } = useWalletConnectButton();
    return (
        <BaseWalletConnectionButton
            {...props}
            disabled={disabled || buttonDisabled}
            onClick={(e) => {
                if (onClick) {
                    onClick(e);
                }
                if (e.defaultPrevented) {
                    return;
                }
                if (onButtonClick) {
                    onButtonClick();
                }
            }}
            walletIcon={walletIcon}
            walletName={walletName}
        >
            {children ? children : labels[buttonState]}
        </BaseWalletConnectionButton>
    );
}
