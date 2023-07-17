import { Button } from '@mui/material';
import { NonceContainer } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { BlockhashWithExpiryBlockHeight, Transaction, TransactionInstruction, TransactionSignature } from '@solana/web3.js';
import { PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useNotify } from './notify';

export const SendNonceTx: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction, wallet } = useWallet();
    const notify = useNotify();
    const supportedTransactionVersions = wallet?.adapter.supportedTransactionVersions;

    const onClick = useCallback(async () => {
        const summary = [];
        let skipped = 0;
        const numTries = 10;
        for (let i = 0; i < numTries; i++) {
            const startTime = performance.now(); // record start time            
            const nonceContainer: NonceContainer | undefined = wallet?.adapter.nonceContainer;
            console.log('Nonce: ', nonceContainer);
            let signature: TransactionSignature | undefined = undefined;
            try {
                if (!publicKey) throw new Error('Wallet not connected!');
                if (!supportedTransactionVersions) throw new Error("Wallet doesn't support versioned transactions!");
                if (!supportedTransactionVersions.has('legacy'))
                    throw new Error("Wallet doesn't support legacy transactions!");
                const transaction = new Transaction();
                const instruction = new TransactionInstruction({
                    data: Buffer.from('Nonce Txs save time'),
                    keys: [],
                    programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
                },);
                let blockhashInfo: BlockhashWithExpiryBlockHeight;

                if (nonceContainer) {
                    transaction.add(nonceContainer.advanceNonce, instruction);
                    transaction.recentBlockhash = nonceContainer.currentNonce;
                }
                else {
                    transaction.add(instruction);
                    blockhashInfo = await connection.getLatestBlockhash();
                    transaction.recentBlockhash = blockhashInfo.blockhash;
                }

                transaction.feePayer = publicKey;

                signature = await sendTransaction(transaction, connection);
                notify('info', 'Transaction sent:', signature);
                if (nonceContainer) {
                    await connection.confirmTransaction({
                        signature,
                        minContextSlot: 0,
                        nonceAccountPubkey: nonceContainer.nonceAccount,
                        nonceValue: nonceContainer.currentNonce
                    }, 'confirmed');
                }
                else {
                    //@ts-ignore
                    await connection.confirmTransaction({ signature, blockhash: blockhashInfo.blockhash, lastValidBlockHeight: blockhashInfo.lastValidBlockHeight }, 'confirmed');
                }
                notify('success', 'Transaction successful!', signature);
                const endTime = performance.now(); // record end time
                const duration = endTime - startTime; // calculate duration
                console.log(`Transaction ${i + 1} completed in ${duration}ms`);
                await new Promise(resolve => setTimeout(resolve, 10000));
                summary.push(duration);

            } catch (error: any) {
                notify('error', `Transaction failed! ${error?.message}`, signature);
                skipped++;
            } finally {
                if (i === numTries - 1) {
                    console.log('Nonce Summary: ', summary);
                    const avg = summary.reduce((a, b) => a + b, 0) / summary.length;
                    console.log('Nonce Average: ', avg);
                    console.log('Skipped: ', skipped);

                }
            }
        }
    }, [publicKey, supportedTransactionVersions, connection, sendTransaction, notify]);

    return (
        <Button
            variant="contained"
            color="secondary"
            onClick={onClick}
            disabled={!publicKey || !supportedTransactionVersions?.has('legacy')}
        >
            Send 10 Nonce Tx (devnet)
        </Button>
    );
};
