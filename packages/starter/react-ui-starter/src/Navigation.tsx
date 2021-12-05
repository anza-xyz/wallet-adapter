import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, { FC } from 'react';

export const Navigation: FC = () => {
    const { connection } = useConnection();

    const { publicKey, sendTransaction } = useWallet();

    return (
        <nav>
            <h1>Solana Starter App</h1>
            <div>
                <WalletMultiButton />
                {publicKey && <WalletDisconnectButton />}
            </div>
        </nav>
    );
};
