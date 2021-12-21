import { WalletReadyState } from '@solana/wallet-adapter-base';
import { WalletWithReadyState } from '@solana/wallet-adapter-react';
import React, { FC, MouseEventHandler } from 'react';
import { Button } from './Button';
import { WalletIcon } from './WalletIcon';

export interface WalletListItemProps {
    handleClick: MouseEventHandler<HTMLButtonElement>;
    tabIndex?: number;
    wallet: WalletWithReadyState;
}

export const WalletListItem: FC<WalletListItemProps> = ({ handleClick, tabIndex, wallet }) => {
    return (
        <li>
            <Button onClick={handleClick} endIcon={<WalletIcon wallet={wallet} />} tabIndex={tabIndex}>
                {wallet.name}
                {wallet.readyState === WalletReadyState.Installed ? ' (detected)' : null}
            </Button>
        </li>
    );
};
