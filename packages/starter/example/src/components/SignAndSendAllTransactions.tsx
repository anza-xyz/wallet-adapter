import { Button } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import type { TransactionSignature } from '@solana/web3.js';
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useNotify } from './notify';
import { WalletSignAndSendAllTransactionsError } from '@solana/wallet-adapter-base';

export const SignAndSendAllTransactions: FC = () => {
    const { connection } = useConnection();
    const { publicKey, signAndSendAllTransactions } = useWallet();
    const notify = useNotify();

    const onClick = useCallback(async () => {
        try {
            if (!publicKey) throw new Error('Wallet not connected!');
            if (!signAndSendAllTransactions) throw new Error('Wallet does not supoport signAndSendAllTransactions!');

            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight },
            } = await connection.getLatestBlockhashAndContext();

            const transactions = [];
            for (let i = 0; i < 5; i++) {
                const transaction = new Transaction({
                    feePayer: publicKey,
                    recentBlockhash: blockhash,
                }).add(
                    new TransactionInstruction({
                        data: Buffer.from(`transaction number ${i}`),
                        keys: [],
                        programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
                    })
                );
                transactions.push(transaction);
            }

            const results = await signAndSendAllTransactions(transactions, connection, { minContextSlot });
            console.log(results);

            // Confirm all transactions
            (async () => {
                await Promise.all(
                    results.map(async (result) => {
                        if (result instanceof WalletSignAndSendAllTransactionsError) {
                            // If the result is an instance of WalletSignAndSendAllTransactionsError, notify about the error
                            notify('error', `Transaction failed: ${result.message}`);
                        } else {
                            try {
                                await connection.confirmTransaction({
                                    blockhash,
                                    lastValidBlockHeight,
                                    signature: result,
                                });
                                notify('success', 'Transaction successful!', result);
                            } catch (error: any) {
                                notify('error', `Transaction failed! ${error?.message}`, result);
                            }
                        }
                    })
                );
            })();
        } catch (error: any) {
            notify('error', `Transactions failed! ${error?.message}`);
        }
    }, [publicKey, connection, signAndSendAllTransactions, notify]);

    return (
        <Button variant="contained" color="secondary" onClick={onClick} disabled={!publicKey}>
            Sign and Send All Transactions (devnet)
        </Button>
    );
};
