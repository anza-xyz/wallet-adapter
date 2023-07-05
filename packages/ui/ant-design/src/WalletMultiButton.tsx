import type { ButtonProps } from 'antd';
import React from 'react';
import { BaseWalletMultiButton } from './BaseWalletMultiButton.js';

const LABELS = {
    'change-wallet': 'Change wallet',
    connecting: 'Connecting ...',
    'copy-address': 'Copy address',
    disconnect: 'Disconnect',
    'has-wallet': 'Connect',
    'no-wallet': 'Select Wallet',
} as const;

export function WalletMultiButton(props: ButtonProps) {
    return <BaseWalletMultiButton {...props} labels={LABELS} />;
}
