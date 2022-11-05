import type { ListItemProps } from '@mui/material';
import { Button, ListItem } from '@mui/material';
import type { Wallet } from '@solana/wallet-adapter-react';
import type { FC, MouseEventHandler } from 'react';
import React from 'react';
import { WalletIcon } from './WalletIcon.js';

interface WalletListItemProps extends Omit<ListItemProps, 'onClick' | 'button'> {
    onClick: MouseEventHandler<HTMLButtonElement>;
    wallet: Wallet;
}

export const WalletListItem: FC<WalletListItemProps> = ({ onClick, wallet, ...props }) => {
    return (
        <ListItem {...props}>
            <Button onClick={onClick} endIcon={<WalletIcon wallet={wallet} />}>
                {wallet.adapter.name}
            </Button>
        </ListItem>
    );
};
