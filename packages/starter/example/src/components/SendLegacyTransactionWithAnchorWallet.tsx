import { Button } from '@mui/material';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import type { TransactionSignature } from '@solana/web3.js';
import { PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useNotify } from './notify';

export const SendLegacyTransactionWithAnchorWallet: FC = () => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const notify = useNotify();

    const onClick = useCallback(async () => {
        if (!wallet?.publicKey) {
            notify('error', 'Wallet not connected!');
            return;
        }

        let signature: TransactionSignature = '';
        try {
            const {
                value: { blockhash, lastValidBlockHeight },
            } = await connection.getLatestBlockhashAndContext();

            const message = new TransactionMessage({
                payerKey: wallet.publicKey,
                instructions: [
                    {
                        data: Buffer.from('Hello, featuring useAnchorWallet'),
                        keys: [],
                        programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
                    },
                ],
                recentBlockhash: blockhash,
            });

            const transaction = new VersionedTransaction(message.compileToLegacyMessage());
            const signedTransaction = await wallet.signTransaction(transaction);

            signature = await connection.sendRawTransaction(signedTransaction.serialize());
            notify('info', 'Transaction sent:', signature);

            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            notify('success', 'Transaction successful!', signature);
        } catch (error: any) {
            notify('error', `Transaction failed! ${error?.message}`, signature);
            return;
        }
    }, [wallet, notify, connection]);

    return (
        <Button variant="contained" color="secondary" onClick={onClick} disabled={!wallet?.publicKey}>
            Send Anchor Friendly Legacy Transaction (devnet)
        </Button>
    );
};
