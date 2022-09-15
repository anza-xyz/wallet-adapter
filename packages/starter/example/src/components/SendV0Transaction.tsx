import { Button } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { AddressLookupTableAccount, AddressLookupTableInstruction, AddressLookupTableProgram, MessageV0, TransactionMessage, TransactionSignature, VersionedTransaction } from '@solana/web3.js';
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useNotify } from './notify';

export const SendV0Transaction: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const notify = useNotify();

    const onClick = useCallback(async () => {
        if (!publicKey) {
            notify('error', 'Wallet not connected!');
            return;
        }

        let signature: TransactionSignature = '';
        try {
            const lookupTable = (await connection.getAddressLookupTable(new PublicKey("F3MfgEJe1TApJiA14nN2m4uAH4EBVrqdBnHeGeSXvQ7B"))).value;
            if (lookupTable === null) {
                notify('error', 'Address lookup table wasn\'t found!');
                return;
            }

            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight },
            } = await connection.getLatestBlockhashAndContext();

            const message = new TransactionMessage({
                payerKey: publicKey,
                instructions: [{
                    data: Buffer.from('Hello, from the Solana Wallet Adapter example app!'),
                    keys: lookupTable.state.addresses.map((pubkey, index) => ({
                        pubkey,
                        isWritable: index % 2 == 0,
                        isSigner: false, 
                    })),
                    programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
                }],
                recentBlockhash: blockhash,
            });

            const lookupTables: AddressLookupTableAccount[] = [lookupTable];
            const transaction = new VersionedTransaction(message.compileToV0Message(lookupTables));

            signature = await sendTransaction(transaction, connection, { minContextSlot });
            notify('info', 'Transaction sent:', signature);

            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            notify('success', 'Transaction successful!', signature);
        } catch (error: any) {
            notify('error', `Transaction failed! ${error?.message}`, signature);
            return;
        }
    }, [publicKey, notify, connection, sendTransaction]);

    return (
        <Button variant="contained" color="secondary" onClick={onClick} disabled={!publicKey}>
            Send V0 Transaction using Address Lookup Table (devnet)
        </Button>
    );
};
