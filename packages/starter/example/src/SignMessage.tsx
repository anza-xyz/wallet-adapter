import { Button } from '@material-ui/core';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import React, { FC, useCallback } from 'react';
import { useNotify } from './notify';

const SignMessage: FC = () => {
    const { publicKey, signMessage } = useWallet();
    const notify = useNotify();

    const onClick = useCallback(async () => {
        if (!publicKey) {
            notify('error', 'Wallet not connected!');
            return;
        }
        if (!signMessage) {
            notify('error', 'Wallet does not support message signing!');
            return;
        }

        try {
            const message = new TextEncoder().encode('Hello, world!');

            const signature = await signMessage(message);
            notify('success', `Message signature: ${bs58.encode(signature)}`);
        } catch (error: any) {
            notify('error', `Signing failed! ${error?.message}`);
            return;
        }
    }, [publicKey, notify, signMessage]);

    return signMessage ? (
        <Button variant="contained" color="secondary" onClick={onClick} disabled={!publicKey}>
            Sign Message
        </Button>
    ) : null;
};

export default SignMessage;
