import { Button, ChakraProvider } from '@chakra-ui/react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletDialogProvider, WalletMultiButton } from '@solana/wallet-adapter-chakra-ui';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import type { FC, ReactNode } from 'react';
import React, { useMemo } from 'react';

export const App: FC = () => {
    return (
        <ChakraProvider>
            <Context>
                <Content />
            </Context>
        </ChakraProvider>
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
             * Wallets that implement either of these standards will be available automatically.
             *
             *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
             *     (https://github.com/solana-mobile/mobile-wallet-adapter)
             *   - Solana Wallet Standard
             *     (https://github.com/solana-labs/wallet-standard)
             *
             * If you wish to support a wallet that supports neither of those standards,
             * instantiate its legacy wallet adapter here. Common legacy adapters can be found
             * in the npm package `@solana/wallet-adapter-wallets`.
             */
            new UnsafeBurnerWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    );

    // const { enqueueSnackbar } = useSnackbar();
    // const onError = useCallback(
    //     (error: WalletError, adapter?: Adapter) => {
    //         enqueueSnackbar(error.message ? `${error.name}: ${error.message}` : error.name, { variant: 'error' });
    //         console.error(error, adapter);
    //     },
    //     [enqueueSnackbar]
    // );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletDialogProvider>{children}</WalletDialogProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const Content: FC = () => {
    return (
        <>
            <Button>Test</Button>

            <WalletMultiButton />
        </>
    );
};
