import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { ReactElement } from 'react';

// Use require instead of import, and order matters
require('antd/dist/antd.dark.less');
require('@solana/wallet-adapter-ant-design/styles.css');
require('@solana/wallet-adapter-react-ui/styles.css');
require('../styles/globals.css');

const ContextProvider = dynamic(() => import('../components/ContextProvider'), {
    ssr: false,
});

function App({ Component, pageProps }: AppProps): ReactElement {
    return (
        <>
            <Head>
                <title>@solana/wallet-adapter Example</title>
            </Head>
            <ContextProvider>
                <Component {...pageProps} />
            </ContextProvider>
        </>
    );
}

export default App;
