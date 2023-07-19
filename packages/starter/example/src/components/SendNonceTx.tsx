import { Button } from '@mui/material';
import { NonceContainer } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { BlockhashWithExpiryBlockHeight, Transaction, TransactionInstruction, TransactionSignature } from '@solana/web3.js';
import { PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useNotify } from './notify';

export type TestType = 'Nonce' | 'Blockhash';
interface RunTestLoopParams {
    test: TestType;
    numTries?: number;
    loopPause?: number;
    txPause?: number;
    confirmPause?: number;
}
export interface TestResult {
    duration: number;
    type: TestType;
    id: number;
}

interface SendNonceTxProps {
    onLoopComplete: (result: TestResult) => void;
    onTestComplete: () => void;
}

export const SendNonceTx: FC<SendNonceTxProps> = ({ onLoopComplete, onTestComplete }) => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction, wallet, signTransaction } = useWallet();
    const notify = useNotify();

    const supportedTransactionVersions = wallet?.adapter.supportedTransactionVersions;

    const onClick = useCallback(async () => {
        const numTries = 3;
        runTestLoop({
            numTries,
            test: 'Nonce',
        });
        runTestLoop({
            numTries,
            test: 'Blockhash'
        });
    }, [publicKey, supportedTransactionVersions, connection, sendTransaction, notify]);

    const runTestLoop = useCallback(async ({
        test,
        numTries = 3,
        loopPause = 5000,
        txPause = 1000,
        confirmPause = 200,
    }: RunTestLoopParams) => {
        const summary = [];
        let skipped = 0;

        for (let i = 0; i < numTries; i++) {
            const startTime = performance.now(); // record start time            
            const nonceContainer: NonceContainer | undefined = wallet?.adapter.nonceContainer;
            let signature: TransactionSignature | undefined = undefined;
            try {
                if (!publicKey) throw new Error('Wallet not connected!');
                if (!supportedTransactionVersions) throw new Error("Wallet doesn't support versioned transactions!");
                if (!supportedTransactionVersions.has('legacy'))
                    throw new Error("Wallet doesn't support legacy transactions!");
                const transaction = new Transaction();
                const instruction = new TransactionInstruction({
                    data: Buffer.from(`${test} Test ${i + 1}`),
                    keys: [],
                    programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
                });

                if (test === 'Nonce' && nonceContainer) {
                    transaction.add(nonceContainer.advanceNonce, instruction);
                    transaction.recentBlockhash = nonceContainer.currentNonce;
                }
                else {
                    transaction.add(instruction);
                    let blockhashInfo: BlockhashWithExpiryBlockHeight;
                    blockhashInfo = await connection.getLatestBlockhash();
                    transaction.recentBlockhash = blockhashInfo.blockhash;
                }

                transaction.feePayer = publicKey;
                if (!signTransaction) throw new Error('Wallet does not support signing transactions!');
                const signed = await signTransaction(transaction);
                signature = await sendTransaction(signed, connection);
                notify('info', 'Transaction sent:', signature);

                // Using this in lieu of confirmationTransaciton because propogation time is too long
                let confirmed = false;
                await wait(txPause);
                while (!confirmed) {
                    await wait(confirmPause);
                    connection.getSignatureStatus(signature).then((result) => {
                        if (result.value?.confirmationStatus === ('confirmed' || 'finalized')) { confirmed = true }
                    });
                }
                notify('success', 'Transaction successful!', signature);
                const endTime = performance.now(); // record end time
                const duration = endTime - startTime; // calculate duration
                summary.push(duration);
                const result: TestResult = {
                    type: test,
                    duration,
                    id: i + 1,
                };
                onLoopComplete(result);
                await wait(loopPause);

            } catch (error: any) {
                notify('error', `Transaction failed! ${error?.message}`, signature);
                skipped++;
            } finally {
                if (i === numTries - 1) {
                    console.log(`${test} Summary`, summary);
                    const avg = summary.reduce((a, b) => a + b, 0) / summary.length;
                    console.log(`${test} Average`, avg);
                    console.log(`${test} Skipped`, skipped);
                    onTestComplete();
                }
            }
            
        }
    }, [publicKey, supportedTransactionVersions, connection, sendTransaction, notify]);

    return (
        <Button
            variant="contained"
            color="secondary"
            onClick={() => onClick()}
            disabled={!publicKey || !supportedTransactionVersions?.has('legacy')}
        >
            Run Test
        </Button>
    );
};


const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));