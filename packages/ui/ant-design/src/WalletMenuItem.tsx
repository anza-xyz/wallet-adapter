import type { Wallet } from '@solana/wallet-adapter-react';
import type { MenuItemProps } from 'antd';
import { Button, Menu } from 'antd';
import type { FC, MouseEventHandler } from 'react';
import React from 'react';
import { WalletIcon } from './WalletIcon.js';

interface WalletMenuItemProps extends Omit<MenuItemProps, 'onClick'> {
    onClick: MouseEventHandler<HTMLButtonElement>;
    wallet: Wallet;
}

export const WalletMenuItem: FC<WalletMenuItemProps> = ({ onClick, wallet, ...props }) => {
    return (
        <Menu.Item className="wallet-adapter-modal-menu-item" {...props}>
            <Button
                onClick={onClick}
                icon={<WalletIcon wallet={wallet} className="wallet-adapter-modal-menu-button-icon" />}
                type="text"
                className="wallet-adapter-modal-menu-button"
                htmlType="button"
                block
            >
                {wallet.adapter.name}
            </Button>
        </Menu.Item>
    );
};
