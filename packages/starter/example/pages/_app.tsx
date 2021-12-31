import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { FC, ReactNode } from 'react';

// Use require instead of import, and order matters
require('antd/dist/antd.dark.less');
require('@solana/wallet-adapter-ant-design/styles.css');
require('@solana/wallet-adapter-react-ui/styles.css');
require('../styles/globals.css');

const ContextProvider = dynamic<{ children: ReactNode }>(
    () => import('../components/ContextProvider').then(({ ContextProvider }) => ContextProvider),
    {
        ssr: false,
    }
);

const App: FC<AppProps> = ({ Component, pageProps }) => {
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
};

export default App;
