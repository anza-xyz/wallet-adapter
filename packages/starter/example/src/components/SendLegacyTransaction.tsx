import { Button } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import type { TransactionSignature } from '@solana/web3.js';
import { PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useNotify } from './notify';

export const SendLegacyTransaction: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction, wallet } = useWallet();
    const notify = useNotify();
    const supportedTransactionVersions = wallet?.adapter.supportedTransactionVersions;

    const onClick = useCallback(async () => {
        let signature: TransactionSignature | undefined = undefined;
        try {
            if (!publicKey) throw new Error('Wallet not connected!');
            if (!supportedTransactionVersions) throw new Error("Wallet doesn't support versioned transactions!");
            if (!supportedTransactionVersions.has('legacy'))
                throw new Error("Wallet doesn't support legacy transactions!");

            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight },
            } = await connection.getLatestBlockhashAndContext();

            const message = new TransactionMessage({
                payerKey: publicKey,
                recentBlockhash: blockhash,
                instructions: [
                    {
                        data: Buffer.from('Hello, from the Solana Wallet Adapter example app!'),
                        keys: [],
                        programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
                    },
                ],
            });
            const transaction = new VersionedTransaction(message.compileToLegacyMessage());

            signature = await sendTransaction(transaction, connection, { minContextSlot });
            notify('info', 'Transaction sent:', signature);

            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            notify('success', 'Transaction successful!', signature);
        } catch (error: any) {
            notify('error', `Transaction failed! ${error?.message}`, signature);
        }
    }, [publicKey, supportedTransactionVersions, connection, sendTransaction, notify]);

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
