import { Wallet } from '@solana/wallet-adapter-wallets';
import { Button, Menu } from 'antd';
import React, { FC, MouseEventHandler } from 'react';
import { WalletIcon } from './WalletIcon';

interface WalletListItemProps {
    handleClick: MouseEventHandler<HTMLButtonElement>;
    wallet: Wallet;
}

export const WalletListItem: FC<WalletListItemProps> = ({ handleClick, wallet }) => {
    return (
        <Menu.Item key={wallet.name} className="wallet-adapter-modal-menu-item">
            <Button
                onClick={handleClick}
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
