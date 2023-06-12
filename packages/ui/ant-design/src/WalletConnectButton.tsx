import { useWalletConnectButton } from '@solana/wallet-adapter-react';
import type { ButtonProps } from 'antd';
import React from 'react';
import { BaseWalletConnectionButton } from './BaseWalletConnectionButton.js';

export function WalletConnectButton({ children, disabled, onClick, ...props }: ButtonProps) {
    const { buttonDisabled, buttonState, onButtonClick, walletIcon, walletName } = useWalletConnectButton();
    let label;
    if (children) {
        label = children;
    } else if (buttonState === 'connecting') {
        label = 'Connecting ...';
    } else if (buttonState === 'connected') {
        label = 'Connected';
    } else if (buttonState === 'has-wallet') {
        label = 'Connect';
    } else {
        label = 'Connect Wallet';
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
