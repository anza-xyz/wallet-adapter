import { useWalletDisconnectButton } from '@solana/wallet-adapter-base-ui';
import type { ButtonProps } from 'antd';
import React from 'react';
import { BaseWalletConnectionButton } from './BaseWalletConnectionButton.js';

type Props = ButtonProps & {
    labels: { [TButtonState in ReturnType<typeof useWalletDisconnectButton>['buttonState']]: string };
};

export function BaseWalletDisconnectButton({ children, disabled, labels, onClick, ...props }: Props) {
    const { buttonDisabled, buttonState, onButtonClick, walletIcon, walletName } = useWalletDisconnectButton();
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
