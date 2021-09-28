import { Button } from '@material-ui/core';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, TransactionSignature } from '@solana/web3.js';
import { FC, useCallback } from 'react';
import { useNotify } from './notify';

const RequestAirdrop: FC = () => {
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

export default RequestAirdrop;
