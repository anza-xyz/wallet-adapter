import { Button } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import type { TransactionSignature } from '@solana/web3.js';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useNotify } from './notify';

export const RequestAirdrop: FC = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const notify = useNotify();

    const onClick = useCallback(async () => {
        if (!publicKey) {
            notify('error', 'Wallet not connected!');
            return;
        }

        let signature: TransactionSignature = '';
        try {
            signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
            notify('info', 'Airdrop requested:', signature);

            await connection.confirmTransaction(signature, 'processed');
            notify('success', 'Airdrop successful!', signature);
        } catch (error: any) {
            notify('error', `Airdrop failed! ${error?.message}`, signature);
        }
    }, [publicKey, notify, connection]);

    return (
        <Button variant="contained" color="secondary" onClick={onClick} disabled={!publicKey}>
            Request Airdrop
        </Button>
    );
};
