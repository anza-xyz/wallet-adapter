import { Button } from '@mui/material';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import type { TransactionSignature } from '@solana/web3.js';
import { PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useNotify } from './notify';

export const SendV0TransactionWithAnchorWallet: FC = () => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const notify = useNotify();

    const onClick = useCallback(async () => {
        if (!wallet?.publicKey) {
            notify('error', 'Wallet not connected!');
            return;
        }

        let signature: TransactionSignature = '';
        try {
            /**
             * This lookup table only exists on devnet and can be replaced as
             * needed.  To create and manage a lookup table, use the `solana
             * address-lookup-table` commands.
             */
            const { value: lookupTable } = await connection.getAddressLookupTable(
                new PublicKey('F3MfgEJe1TApJiA14nN2m4uAH4EBVrqdBnHeGeSXvQ7B')
            );
            if (!lookupTable) {
                notify('error', "Address lookup table wasn't found!");
                return;
            }

            const {
                value: { blockhash, lastValidBlockHeight },
            } = await connection.getLatestBlockhashAndContext();

            const message = new TransactionMessage({
                payerKey: wallet.publicKey,
                instructions: [
                    {
                        data: Buffer.from('Hello, featuring useAnchorWallet'),
                        keys: lookupTable.state.addresses.map((pubkey, index) => ({
                            pubkey,
                            isWritable: index % 2 == 0,
                            isSigner: false,
                        })),
                        programId: new PublicKey('Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo'),
                    },
                ],
                recentBlockhash: blockhash,
            });

            const lookupTables = [lookupTable];
            const transaction = new VersionedTransaction(message.compileToV0Message(lookupTables));
            const signedTransaction = await wallet.signTransaction(transaction);

            signature = await connection.sendRawTransaction(signedTransaction.serialize());
            notify('info', 'Transaction sent:', signature);

            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            notify('success', 'Transaction successful!', signature);
        } catch (error: any) {
            notify('error', `Transaction failed! ${error?.message}`, signature);
            return;
        }
    }, [wallet, notify, connection]);

    return (
        <Button variant="contained" color="secondary" onClick={onClick} disabled={!wallet?.publicKey}>
            Send Anchor Frienldy V0 Transaction using Address Lookup Table (devnet)
        </Button>
    );
};
