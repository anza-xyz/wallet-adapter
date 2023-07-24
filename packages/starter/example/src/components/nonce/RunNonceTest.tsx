import { Button } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, TransactionInstruction, TransactionSignature } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { FC } from 'react';
import React, { useCallback } from 'react';
import { useNotify } from '../notify';
import { wait } from '../../utils/helpers';

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
    onStart: () => void;
    onLoopComplete: (result: TestResult) => void;
    onTestComplete: () => void;
    running: boolean;
}

export const RunNonceTest: FC<SendNonceTxProps> = ({ onStart, onLoopComplete, onTestComplete }) => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction, wallet, signTransaction } = useWallet();
    const notify = useNotify();
    let numComplete = 0;
    const supportedTransactionVersions = wallet?.adapter.supportedTransactionVersions;

    const onClick = useCallback(async () => {
        const numTries = 5;
        onStart();
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

                const useNonce = test === 'Nonce';
                transaction.add(instruction);
                transaction.feePayer = publicKey;
                if (!signTransaction) throw new Error('Wallet does not support signing transactions!');
                signature = await sendTransaction(transaction, connection, { useNonce });
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

                    // Wait until both tests finish before calling onTestComplete
                    numComplete++;
                    if (numComplete === 2) onTestComplete();
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