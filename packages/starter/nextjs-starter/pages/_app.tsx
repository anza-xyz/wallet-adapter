import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { ReactElement } from 'react';

// Use require instead of import, and order matters
require('../styles/globals.css');

const WalletConnectionProvider = dynamic(() => import('../components/WalletConnectionProvider'), {
    ssr: false,
});

function App({ Component, pageProps }: AppProps): ReactElement {
    return (
        <WalletConnectionProvider>
            <Component {...pageProps} />
        </WalletConnectionProvider>
    );
}

export default App;
