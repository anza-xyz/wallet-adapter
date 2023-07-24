import { Button } from '@mui/material';
import { WalletNoNonceError, WalletNotConnectedError, WalletTimeoutError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { Transaction, TransactionInstruction, TransactionSignature, PublicKey } from '@solana/web3.js';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { wait } from '../../utils/helpers';
import { useNotify } from '../notify';

export const SendNonceTransaction: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction, wallet, signTransaction } = useWallet();
    const adapter = wallet?.adapter as UnsafeBurnerWalletAdapter;
    const notify = useNotify();

    const onClick = useCallback(async () => {
        let signature: TransactionSignature | undefined = undefined;

        try {
            if (!publicKey) throw new WalletNotConnectedError('Wallet not connected!');
            if (!adapter.nonceContainer) throw new WalletNoNonceError("Wallet does not have a nonce account!");

            const transaction = new Transaction();
            const instruction = new TransactionInstruction({
                data: Buffer.from(`Nonce Wallet Adapter Test`),
                keys: [],
                programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
            });

            transaction.add(instruction);
            transaction.feePayer = publicKey;

            // Send transaction will handle advanceNonce, adding blockhash, and signing
            signature = await sendTransaction(transaction, connection, { useNonce: true });
            notify('info', 'Transaction sent:', signature);

            // Using this in lieu of confirmationTransaciton because polling time is too long
            let confirmed = false;
            let isTimeout = false;
            
            setTimeout(() => {
                isTimeout = true;
            }, 30000);
            while (!confirmed && !isTimeout) {
                await wait(200);
                connection.getSignatureStatus(signature).then((result) => {
                    if (result.value?.confirmationStatus) {confirmed = true}                    
                });
            }
            if (isTimeout) {
                throw new WalletTimeoutError('Transaction timed out waiting for confirmation!');
            }
            notify('success', 'Transaction successful!', signature);
        } catch (error: any) {
            notify('error', `Transaction failed! ${error?.message}`, signature);
        } 
    }, [publicKey, connection, notify, adapter, sendTransaction, signTransaction]);

    return (
        <Button variant="contained" color="secondary" onClick={onClick} disabled={!publicKey}>
            Send Nonce Tx
        </Button>
    );
};

