import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { FC, ReactNode } from 'react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

// Use require instead of import, and order matters
require('../styles/globals.css');

const WalletConnectionProvider = dynamic<{ children: ReactNode }>(
    () =>
        import('../components/WalletConnectionProvider').then(
            ({ WalletConnectionProvider }) => WalletConnectionProvider
        ),
    {
        ssr: false,
    }
);

const App: FC<AppProps> = ({ Component, pageProps }) => {
    return (
        <WalletConnectionProvider>
            <WalletModalProvider>
                <Component {...pageProps} />
            </WalletModalProvider>
        </WalletConnectionProvider>
    );
};

export default App;
