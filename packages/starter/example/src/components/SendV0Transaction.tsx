import { Button } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import type { TransactionSignature } from '@solana/web3.js';
import { PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useNotify } from './notify';

export const SendV0Transaction: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction, wallet } = useWallet();
    const notify = useNotify();
    const supportedTransactionVersions = wallet?.adapter.supportedTransactionVersions;

    const onClick = useCallback(async () => {
        let signature: TransactionSignature | undefined = undefined;
        try {
            if (!publicKey) throw new Error('Wallet not connected!');
            if (!supportedTransactionVersions) throw new Error("Wallet doesn't support versioned transactions!");
            if (!supportedTransactionVersions.has(0)) throw new Error("Wallet doesn't support v0 transactions!");

            /**
             * This lookup table only exists on devnet and can be replaced as
             * needed.  To create and manage a lookup table, use the `solana
             * address-lookup-table` commands.
             */
            const { value: lookupTable } = await connection.getAddressLookupTable(
                new PublicKey('F3MfgEJe1TApJiA14nN2m4uAH4EBVrqdBnHeGeSXvQ7B')
            );
            if (!lookupTable) throw new Error("Address lookup table wasn't found!");

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
                        keys: lookupTable.state.addresses.map((pubkey, index) => ({
                            pubkey,
                            isWritable: index % 2 == 0,
                            isSigner: false,
                        })),
                        programId: new PublicKey('Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo'),
                    },
                ],
            });
            const transaction = new VersionedTransaction(message.compileToV0Message([lookupTable]));

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
            disabled={!publicKey || !supportedTransactionVersions?.has(0)}
        >
            Send V0 Transaction using Address Lookup Table (devnet)
        </Button>
    );
};
