import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import '../styles/globals.css';

const WalletConnectionProvider = dynamic(() => import('../components/WalletConnectionProvider'), {
    ssr: false,
});

function App({ Component, pageProps }: AppProps) {
    return (
        <WalletConnectionProvider>
            <Component {...pageProps} />
        </WalletConnectionProvider>
    );
}

export default App;
