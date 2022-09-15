import { Button } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { AddressLookupTableAccount, TransactionMessage, TransactionSignature, VersionedTransaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useNotify } from './notify';

export const SendV0Transaction: FC = () => {
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
            notify('error', 'Wallet doesn\'t support versioned transactions!');
            return;
        } else if (!supportedTransactionVersions.has(0)) {
            notify('error', 'Wallet doesn\'t support v0 transactions!');
            return;
        }

        let signature: TransactionSignature = '';
        try {
            /**
             * This lookup table only exists on devnet and can be replaced as
             * needed.  To create and manage a lookup table, use the `solana
             * address-lookup-table` commands.
             */
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
    }, [publicKey, notify, connection, sendTransaction, supportedTransactionVersions]);

    const disabled = !publicKey || !(supportedTransactionVersions && supportedTransactionVersions.has(0));
    return (
        <Button variant="contained" color="secondary" onClick={onClick} disabled={disabled}>
            Send V0 Transaction using Address Lookup Table (devnet)
        </Button>
    );
};
