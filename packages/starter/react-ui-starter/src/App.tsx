import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { TorusWalletAdapter, UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
    clusterApiUrl,
    Connection,
    PublicKey,
    SystemInstruction,
    SystemProgram,
    Transaction,
    TransactionMessage,
    VersionedTransaction,
} from '@solana/web3.js';
import type { FC, ReactNode } from 'react';
import React, { useMemo } from 'react';

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
            new TorusWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

const Content: FC = () => {
    const { wallet, signAllTransactions } = useWallet();
    const testSignAll = async () => {
        const conn = new Connection(clusterApiUrl('devnet'));
        const blockhash = await conn.getLatestBlockhash();

        const transaction = SystemProgram.transfer({
            fromPubkey: new PublicKey('77W86rgpsMmszwunKw9QUdF9pwPoKXWVecSRJZLVWh2Y'),
            toPubkey: new PublicKey('77W86rgpsMmszwunKw9QUdF9pwPoKXWVecSRJZLVWh2Y'),
            lamports: 10000,
        });
        const transaction2 = SystemProgram.transfer({
            fromPubkey: new PublicKey('77W86rgpsMmszwunKw9QUdF9pwPoKXWVecSRJZLVWh2Y'),
            toPubkey: new PublicKey('77W86rgpsMmszwunKw9QUdF9pwPoKXWVecSRJZLVWh2Y'),
            lamports: 20000,
        });
        const tm = new TransactionMessage({
            payerKey: new PublicKey('77W86rgpsMmszwunKw9QUdF9pwPoKXWVecSRJZLVWh2Y'),
            recentBlockhash: blockhash.blockhash,
            instructions: [transaction],
        });
        const tm2 = new TransactionMessage({
            payerKey: new PublicKey('77W86rgpsMmszwunKw9QUdF9pwPoKXWVecSRJZLVWh2Y'),
            recentBlockhash: blockhash.blockhash,
            instructions: [transaction2],
        });

        // const tx = new VersionedTransaction(tm.compileToV0Message());
        // const tx2 = new VersionedTransaction(tm2.compileToV0Message());

        const tx = new Transaction( {
            feePayer: new PublicKey('77W86rgpsMmszwunKw9QUdF9pwPoKXWVecSRJZLVWh2Y'),
            recentBlockhash: blockhash.blockhash,
        });
        tx.add(transaction);
        const tx2 = new Transaction( {
            feePayer: new PublicKey('77W86rgpsMmszwunKw9QUdF9pwPoKXWVecSRJZLVWh2Y'),
            recentBlockhash: blockhash.blockhash,
        });
        tx2.add(transaction2);

        if (wallet) {
            signAllTransactions([tx, tx2])
        }
    };
    return <>
    <WalletMultiButton />;
    <button onClick={testSignAll}>Test Sign All</button>
    </>
};
