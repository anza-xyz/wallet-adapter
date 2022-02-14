import { Wallet } from '@solana/wallet-adapter-react';
import React, { DetailedHTMLProps, FC, ImgHTMLAttributes } from 'react';

export interface WalletIconProps extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    wallet: Wallet | null;
}

export const WalletIcon: FC<WalletIconProps> = ({ wallet, ...props }) => {
    return wallet && <img src={wallet.adapter.icon} alt={`${wallet.adapter.name} icon`} {...props} />;
};
