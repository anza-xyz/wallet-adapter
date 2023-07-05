import { useWalletDisconnectButton } from '@solana/wallet-adapter-react';
import React from 'react';
import { BaseWalletConnectionButton } from './BaseWalletConnectionButton.js';
import type { ButtonProps } from './Button.js';

export function WalletDisconnectButton({ children, disabled, onClick, ...props }: ButtonProps) {
    const { buttonDisabled, buttonState, onButtonClick, walletIcon, walletName } = useWalletDisconnectButton();
    let label;
    if (children) {
        label = children;
    } else if (buttonState === 'disconnecting') {
        label = 'Disconnecting ...';
    } else if (buttonState === 'has-wallet') {
        label = 'Disconnect';
    } else {
        label = 'Disconnect Wallet';
    }
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
            {label}
        </BaseWalletConnectionButton>
    );
}
