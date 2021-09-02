import { Button, ListItem, ListItemProps } from '@material-ui/core';
import { Wallet } from '@solana/wallet-adapter-wallets';
import React, { FC, MouseEventHandler } from 'react';
import { WalletIcon } from './WalletIcon';

interface WalletListItemProps extends Omit<ListItemProps, 'onClick' | 'button'> {
    onClick: MouseEventHandler<HTMLButtonElement>;
    wallet: Wallet;
}

export const WalletListItem: FC<WalletListItemProps> = ({ onClick, wallet, ...props }) => {
    return (
        <ListItem {...props}>
            <Button onClick={onClick} endIcon={<WalletIcon wallet={wallet} />}>
                {wallet.name}
            </Button>
        </ListItem>
    );
};
