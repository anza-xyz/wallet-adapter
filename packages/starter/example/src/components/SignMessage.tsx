import { Button } from '@mui/material';
import { ed25519 } from '@noble/curves/ed25519';
import { useWallet } from '@solana/wallet-adapter-react';
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

            const message = new TextEncoder().encode(
                `${
                    window.location.host
                } wants you to sign in with your Solana account:\n${publicKey.toBase58()}\n\nPlease sign in.`
            );
            const signature = await signMessage(message);

            if (!ed25519.verify(signature, message, publicKey.toBytes())) throw new Error('Message signature invalid!');
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
