import { makeStyles, Theme } from '@material-ui/core';
import { Wallet } from '@solana/wallet-adapter-wallets';
import React, { DetailedHTMLProps, FC, ImgHTMLAttributes } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        width: theme.spacing(3),
        height: theme.spacing(3),
    },
}));

export interface WalletIconProps extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    wallet?: Wallet;
}

export const WalletIcon: FC<WalletIconProps> = ({ wallet, ...props }) => {
    const styles = useStyles();

    return wallet ? <img src={wallet.icon} alt={`${wallet.name} icon`} className={styles.root} {...props} /> : null;
};
