import { Button } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { verifySignIn } from '@solana/wallet-standard-util';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useNotify } from './notify';

export const SignIn: FC = () => {
    const { signIn } = useWallet();
    const notify = useNotify();

    const onClick = useCallback(async () => {
        try {
            if (!signIn) throw new Error('Wallet does not support message signing!');

            // FIXME: wrap this for wallet adapter to simplify args
            const input = {};
            const output = await signIn(input);
            if (!verifySignIn(input, output)) throw new Error('Sign in signature invalid!');

            notify('success', `Signed in: ${output.account.address}`);
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
