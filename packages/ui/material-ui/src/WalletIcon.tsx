import { Theme } from '@mui/material';
import { styled } from '@mui/material';
import { Wallet } from '@solana/wallet-adapter-react';
import React, { DetailedHTMLProps, FC, ImgHTMLAttributes } from 'react';

const Img = styled('img')(({ theme }: { theme: Theme }) => ({
    width: theme.spacing(3),
    height: theme.spacing(3),
}));

export interface WalletIconProps extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    wallet: Wallet | null;
}

export const WalletIcon: FC<WalletIconProps> = ({ wallet, ...props }) => {
    return wallet && <Img src={wallet.adapter.icon} alt={`${wallet.adapter.name} icon`} {...props} />;
};
