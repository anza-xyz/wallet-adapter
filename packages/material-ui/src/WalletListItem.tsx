import { Button, ListItem } from '@material-ui/core';
import { Wallet } from '@solana/wallet-adapter-wallets';
import React, { FC, MouseEventHandler } from 'react';
import { WalletIcon } from './WalletIcon';

interface WalletListItemProps {
    handleClick: MouseEventHandler<HTMLButtonElement>;
    wallet: Wallet;
}

export const WalletListItem: FC<WalletListItemProps> = ({ handleClick, wallet }) => {
    return (
        <ListItem>
            <Button onClick={handleClick} endIcon={<WalletIcon wallet={wallet} />}>
                {wallet.name}
            </Button>
        </ListItem>
    );
};
