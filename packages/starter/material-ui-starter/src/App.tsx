import type { WalletError } from '@solana/wallet-adapter-base';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletDialogProvider, WalletMultiButton } from '@solana/wallet-adapter-material-ui';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { FakeWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useSnackbar } from 'notistack';
import type { FC, ReactNode } from 'react';
import React, { useCallback, useMemo } from 'react';
import { Theme } from './Theme.js';

export const App: FC = () => {
    return (
        <Theme>
            <Context>
                <Content />
            </Context>
        </Theme>
    );
};

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            /**
             * Select the wallets you wish to support, by instantiating wallet adapters here.
             *
             * Common adapters can be found in the npm package `@solana/wallet-adapter-wallets`.
             * That package supports tree shaking and lazy loading -- only the wallets you import
             * will be compiled into your application, and only the dependencies of wallets that
             * your users connect to will be loaded.
             */
            new FakeWalletAdapter(),
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
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} onError={onError} autoConnect>
                <WalletDialogProvider>{children}</WalletDialogProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const Content: FC = () => {
    return <WalletMultiButton />;
};
