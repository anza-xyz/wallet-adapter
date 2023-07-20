import React from 'react';
import { BaseWalletDisconnectButton } from './BaseWalletDisconnectButton.js';
import type { ButtonProps } from './Button.js';

const LABELS = {
    disconnecting: 'Disconnecting ...',
    'has-wallet': 'Disconnect',
    'no-wallet': 'Disconnect Wallet',
} as const;

export function WalletDisconnectButton(props: ButtonProps) {
    return <BaseWalletDisconnectButton {...props} labels={LABELS} />;
}
