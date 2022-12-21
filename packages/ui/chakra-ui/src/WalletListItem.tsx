import type { ListItemProps } from '@chakra-ui/react';
import { Button, ListItem } from '@chakra-ui/react';
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
        <ListItem {...props} w="full" h="16">
            <Button
                onClick={onClick}
                leftIcon={<WalletIcon wallet={wallet} />}
                variant="ghost"
                w="full"
                justifyContent="start"
                rounded="none"
                py={2}
                h="full"
            >
                {wallet.adapter.name}
            </Button>
        </ListItem>
    );
};
