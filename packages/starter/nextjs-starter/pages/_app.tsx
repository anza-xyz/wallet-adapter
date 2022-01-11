import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { AppProps } from 'next/app';
import { FC } from 'react';
import { WalletConnectionProvider } from '../components/WalletConnectionProvider';

// Use require instead of import, and order matters
require('../styles/globals.css');
require('@solana/wallet-adapter-react-ui/styles.css');

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
