import { WalletError } from '@solana/wallet-adapter-base';
import { WalletDialogProvider } from '@solana/wallet-adapter-material-ui';
import { WalletProvider } from '@solana/wallet-adapter-react';
import {
    getLedgerWallet,
    getMathWallet,
    getPhantomWallet,
    getSolflareWallet,
    getSolletWallet,
    getSolongWallet,
    getTorusWallet,
} from '@solana/wallet-adapter-wallets';
import { useSnackbar } from 'notistack';
import React, { FC, useCallback, useMemo } from 'react';
import Navigation from './Navigation';

const Wallet: FC = () => {
    // @solana/wallet-adapter-wallets imports all the adapters but supports tree shaking --
    // Only the wallets you want to support will be compiled into your application
    const wallets = useMemo(
        () => [
            getPhantomWallet(),
            getTorusWallet({
                clientId: 'BOM5Cl7PXgE9Ylq1Z1tqzhpydY0RVr8k90QQ85N7AKI5QGSrr9iDC-3rvmy0K_hF0JfpLMiXoDhta68JwcxS1LQ',
            }),
            getLedgerWallet(),
            getSolongWallet(),
            getMathWallet(),
            getSolletWallet(),
            getSolflareWallet(),
        ],
        []
    );

    const { enqueueSnackbar } = useSnackbar();
    const onError = useCallback(
        (error: WalletError) => {
            enqueueSnackbar(error.message ? `${error.name}: ${error.message}` : error.name, { variant: 'error' });
            console.error(error);
        },
        [enqueueSnackbar]
    );

    return (
        <WalletProvider wallets={wallets} onError={onError} autoConnect>
            <WalletDialogProvider>
                <Navigation />
            </WalletDialogProvider>
        </WalletProvider>
    );
};

export default Wallet;
