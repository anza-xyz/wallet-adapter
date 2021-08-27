import { Button } from './Button';
import { Wallet } from '@solana/wallet-adapter-wallets';
import React, { FC, MouseEventHandler } from 'react';
import { WalletIcon } from './WalletIcon';

interface WalletListItemProps {
    handleClick: MouseEventHandler<HTMLButtonElement>;
    wallet: Wallet;
}

export const WalletListItem: FC<WalletListItemProps> = ({ handleClick, wallet }) => {
    return (
        <li role="option">
            <Button onClick={handleClick} endIcon={<WalletIcon wallet={wallet} />}>
                {wallet.name}
            </Button>
        </li>
    );
};
