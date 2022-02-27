import React, { FC, useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Button, ButtonProps } from './Button';
import { WalletAdapterNetworks } from './NetworkModal';
import { useNetworkModal } from './useNetworkModal';

export interface NetworkButtonProps {
    className?: string;
}

export const NetworkButton: FC<NetworkButtonProps> = ({ className = '' }) => {
    const { endpoint } = useConnection();
    const [network, setNetwork] = useState<{ label: string; value: string }>(WalletAdapterNetworks[0]);
    const { setModalVisible } = useNetworkModal();

    const openNetworkModal = useCallback(() => {
        setModalVisible(true);
    }, []);
    const determineCluster = () => {
        if (endpoint === 'https://api.devnet.solana.com' || endpoint === 'http://api.devnet.solana.com') {
            setNetwork(WalletAdapterNetworks[2]);
        } else if (endpoint === 'https://api.testnet.solana.com' || endpoint === 'http://testnet.solana.com') {
            setNetwork(WalletAdapterNetworks[1]);
        } else if (
            endpoint === 'https://api.mainnet-beta.solana.com/' ||
            endpoint === 'http://api.mainnet-beta.solana.com/'
        ) {
            setNetwork(WalletAdapterNetworks[0]);
        } else {
            setNetwork({ label: 'Custom', value: 'Custom' });
        }
    };
    console.log(endpoint);
    useEffect(() => {
        determineCluster();
    });
    return (
        <Button className={className} onClick={openNetworkModal}>
            {network.label}
        </Button>
    );
};
