import { Button } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import type { TransactionSignature } from '@solana/web3.js';
import { TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useNotify } from './notify';

export const SendLegacyTransaction: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction, wallet } = useWallet();
    const notify = useNotify();
    const supportedTransactionVersions = wallet?.adapter.supportedTransactionVersions;

    const onClick = useCallback(async () => {
        if (!publicKey) {
            notify('error', 'Wallet not connected!');
            return;
        }

        if (!supportedTransactionVersions) {
            notify('error', "Wallet doesn't support versioned transactions!");
            return;
        } else if (!supportedTransactionVersions.has('legacy')) {
            notify('error', "Wallet doesn't support legacy transactions!");
            return;
        }

        let signature: TransactionSignature = '';
        try {
            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight },
            } = await connection.getLatestBlockhashAndContext();

            const message = new TransactionMessage({
                payerKey: publicKey,
                instructions: [
                    {
                        data: Buffer.from('Hello, from the Solana Wallet Adapter example app!'),
                        keys: [],
                        programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
                    },
                ],
                recentBlockhash: blockhash,
            });

            const transaction = new VersionedTransaction(message.compileToLegacyMessage());

            signature = await sendTransaction(transaction, connection, { minContextSlot });
            notify('info', 'Transaction sent:', signature);

            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            notify('success', 'Transaction successful!', signature);
        } catch (error: any) {
            notify('error', `Transaction failed! ${error?.message}`, signature);
            return;
        }
    }, [publicKey, notify, connection, sendTransaction, supportedTransactionVersions]);

    return (
        <Button
            variant="contained"
            color="secondary"
            onClick={onClick}
            disabled={!publicKey || !supportedTransactionVersions?.has('legacy')}
        >
            Send Legacy Transaction (devnet)
        </Button>
    );
};
