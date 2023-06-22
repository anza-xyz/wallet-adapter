import { Button } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { verifySignMessage } from '@solana/wallet-standard-util';
import bs58 from 'bs58';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useNotify } from './notify';

export const SignMessage: FC = () => {
    const { publicKey, signMessage } = useWallet();
    const notify = useNotify();

    const onClick = useCallback(async () => {
        try {
            if (!publicKey) throw new Error('Wallet not connected!');
            if (!signMessage) throw new Error('Wallet does not support message signing!');

            const message = new TextEncoder().encode('Hello, world!');
            const signature = await signMessage(message);
            if (
                // FIXME: wrap this for wallet adapter to simplify args
                !verifySignMessage(
                    {
                        account: {
                            address: publicKey.toBase58(),
                            publicKey: publicKey.toBytes(),
                            chains: [],
                            features: [],
                        },
                        message,
                    },
                    {
                        signedMessage: message,
                        signature,
                    }
                )
            )
                throw new Error('Message signature invalid!');

            notify('success', `Message signature: ${bs58.encode(signature)}`);
        } catch (error: any) {
            notify('error', `Sign Message failed: ${error?.message}`);
        }
    }, [publicKey, signMessage, notify]);

    return (
        <Button variant="contained" color="secondary" onClick={onClick} disabled={!publicKey || !signMessage}>
            Sign Message
        </Button>
    );
};
