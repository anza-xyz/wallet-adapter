import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
    FractalWalletAdapter,
    LedgerWalletAdapter,
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
    SolletWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Message, Transaction } from '@solana/web3.js';
import base58 from 'bs58';
import React, { FC, ReactNode, useMemo } from 'react';

export const App: FC = () => {
    return (
        <Context>
            <Content />
        </Context>
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
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new SolletWalletAdapter({ network }),
            new FractalWalletAdapter({ network }),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

function testTransferTxn(): Transaction {
    const msg = Message.from(
        Buffer.from(
            base58.decode(
                'QwE1XY3GgqxyfNbYPTA6ZSRXMiaE7CsNoepXhcxScVLyhpnNbzxDowsvi1DHABqMLaAyefJSfkj1DtsWcG4yFcNWZprpLL1Lt4hxPvBSRbp9HQ5jH6naWAocb2ouZdVMoNcTy337rZ1QYLsqkk7SSVmRbcWDwEhD'
            )
        )
    );
    return Transaction.populate(msg);
}

const Content: FC = () => {
    const wallet = useWallet();
    return (
        <>
            <button onClick={() => wallet?.signMessage && wallet.signMessage(Buffer.from('hi')).then(console.log)}>
                Test signing
            </button>
            <button
                onClick={() => wallet?.signTransaction && wallet.signTransaction(testTransferTxn()).then(console.log)}
            >
                Test Txn
            </button>
            <button
                onClick={() =>
                    wallet?.signAllTransactions &&
                    wallet.signAllTransactions([testTransferTxn(), testTransferTxn()]).then(console.log)
                }
            >
                Test Txns
            </button>

            <WalletMultiButton />
        </>
    );
};
