import { createDefaultAuthorizationResultCache, SolanaMobileWalletAdapter } from '@solana-mobile/wallet-adapter-mobile';
import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { WalletDialogProvider, WalletMultiButton } from '@solana/wallet-adapter-material-ui';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
    ParticleAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useSnackbar } from 'notistack';
import React, { FC, ReactNode, useCallback, useMemo } from 'react';
import { Theme } from './Theme';

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

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            new SolanaMobileWalletAdapter({
                appIdentity: { name: 'Material UI Starter App' },
                authorizationResultCache: createDefaultAuthorizationResultCache(),
            }),
            new ParticleAdapter({
                projectId: '34c6b829-5b89-44e8-90a9-6d982787b9c9',
                clientKey: 'c6Z44Ml4TQeNhctvwYgdSv6DBzfjf6t6CB0JDscR',
                appId: '64f36641-b68c-4b19-aa10-5c5304d0eab3',
                chainName: 'solana',
                chainId: 103,
            }),
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
        ],
        [network]
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
