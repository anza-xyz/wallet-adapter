import { Wallet } from '@solana/wallet-adapter-wallets';
import React, { DetailedHTMLProps, FC, ImgHTMLAttributes } from 'react';

export interface WalletIconProps extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    wallet?: Wallet;
}

export const WalletIcon: FC<WalletIconProps> = ({ wallet, ...props }) => {
    return wallet ? (
        <img
            src={wallet.icon}
            alt={`${wallet.name} icon`}
            className="wallet-adapter-icon"
            {...props}
        />
    ) : null;
};
