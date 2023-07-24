import { Button } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useNotify } from '../notify';

interface InitiateNonceProps {
    onInit?: () => void;
}

export const InitiateNonce: FC<InitiateNonceProps> = ({onInit}) => {
    const { connection } = useConnection();
    const { publicKey, wallet } = useWallet();
    const adapter = wallet?.adapter as UnsafeBurnerWalletAdapter;
    const notify = useNotify();

    const onClick = useCallback(async () => {
        try {
            if (!publicKey) throw new Error('Wallet not connected!');
            if (!adapter.initiateNonce) throw new Error('Wallet does not support nonce initiation!');
            await adapter.initiateNonce(connection)
            notify('success', 'Nonce account created!');
            onInit && onInit();
        } catch (error: any) {
            notify('error', `Nonce initiation failed! ${error?.message}`);
        }
    }, [publicKey, connection, notify, adapter]);

    return (
        <Button variant="contained" color="secondary" onClick={onClick} disabled={!publicKey}>
            Init Nonce
        </Button>
    );
};
