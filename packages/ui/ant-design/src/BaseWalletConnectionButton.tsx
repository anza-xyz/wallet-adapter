import type { ButtonProps } from 'antd';
import { Button } from 'antd';
import React from 'react';

import type { WalletName } from '@solana/wallet-adapter-base';
import { WalletIcon } from './WalletIcon.js';

type Props = ButtonProps & {
    walletIcon?: string;
    walletName?: WalletName;
};

export function BaseWalletConnectionButton({
    htmlType = 'button',
    size = 'large',
    type = 'primary',
    walletIcon,
    walletName,
    ...props
}: Props) {
    return (
        <Button
            {...props}
            htmlType={htmlType}
            icon={
                walletIcon && walletName ? (
                    <WalletIcon wallet={{ adapter: { icon: walletIcon, name: walletName } }} />
                ) : undefined
            }
            type={type}
            size={size}
        />
    );
}
