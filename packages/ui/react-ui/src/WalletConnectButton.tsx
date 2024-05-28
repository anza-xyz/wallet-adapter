import React from 'react';
import { BaseWalletConnectButton, Props as BaseProps } from './BaseWalletConnectButton.js';

export type WalletConnectButtonProps = Omit<BaseProps, 'labels'> & {labels?: Partial<BaseProps['labels']>};

const LABELS = {
    connecting: 'Connecting ...',
    connected: 'Connected',
    'has-wallet': 'Connect',
    'no-wallet': 'Connect Wallet',
} as const;

export function WalletConnectButton(props: WalletConnectButtonProps) {
    props.labels = { ...LABELS, ...props.labels };
    return <BaseWalletConnectButton {...(props as BaseProps)} />;
}
