import { Button } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useNotify } from './notify';

export const SignIn: FC = () => {
    const { signIn } = useWallet();
    const notify = useNotify();

    const onClick = useCallback(async () => {
        try {
            if (!signIn) throw new Error('Wallet does not support message signing!');

            const { signature } = await signIn();

            notify('success', `Message signature: ${bs58.encode(signature)}`);
        } catch (error: any) {
            notify('error', `Sign In failed: ${error?.message}`);
        }
    }, [signIn, notify]);

    return (
        <Button variant="contained" color="secondary" onClick={onClick} disabled={!signIn}>
            Sign In
        </Button>
    );
};
