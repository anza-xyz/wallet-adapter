import { Wallet } from '@solana/wallet-adapter-wallets';
import { Button, Menu, MenuItemProps } from 'antd';
import React, { FC, MouseEventHandler } from 'react';
import { WalletIcon } from './WalletIcon';

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
                block
            >
                {wallet.name}
            </Button>
        </Menu.Item>
    );
};
