import { Button } from '@mui/material';
import type { StandardWalletAdapter } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { SolanaSignOffchainMessage, type SolanaSignOffchainMessageFeature } from '@solana/wallet-standard-features';
import bs58 from 'bs58';
import React, { useCallback, useMemo, type FC } from 'react';
import { useNotify } from './useNotify';

export const SignOffchainMessage: FC = () => {
    const { wallet, publicKey } = useWallet();
    const notify = useNotify();

    // HACK: the `solana:signOffchainMessage` feature isn't part of the wallet-adapter
    // abstraction yet, so we reach directly into the underlying Standard wallet that
    // `StandardWalletAdapter` exposes via `adapter.wallet` and call the feature ourselves.
    const standardWallet = useMemo(() => {
        const adapter = wallet?.adapter;
        return adapter && 'wallet' in adapter ? (adapter as StandardWalletAdapter).wallet : undefined;
    }, [wallet]);
    const supported = !!standardWallet && SolanaSignOffchainMessage in standardWallet.features;

    const onClick = useCallback(async () => {
        try {
            if (!publicKey) throw new Error('Wallet not connected!');
            if (!standardWallet || !(SolanaSignOffchainMessage in standardWallet.features))
                throw new Error('Wallet does not support offchain message signing!');

            const account =
                standardWallet.accounts.find((a) => a.address === publicKey.toBase58()) ??
                standardWallet.accounts[0];
            if (!account) throw new Error('No connected account!');

            const feature = (standardWallet.features as SolanaSignOffchainMessageFeature)[SolanaSignOffchainMessage];
            const [output] = await feature.signOffchainMessage({
                messageVersion: 1,
                account,
                message: `${window.location.host} wants you to sign an offchain message.`,
                requiredSigners: [account.publicKey],
            });

            if (!output) throw new Error('No signature returned!');
            const details = [
                `signature: ${bs58.encode(output.signature as Uint8Array)}`,
                `signedOffchainMessage: ${bs58.encode(output.signedOffchainMessage as Uint8Array)}`,
                `signatureType: ${output.signatureType ?? 'ed25519 (default)'}`,
            ].join(' | ');
            notify('success', `Offchain message signed — ${details}`);
        } catch (error: any) {
            notify('error', `Sign Offchain Message failed: ${error?.message}`);
        }
    }, [publicKey, standardWallet, notify]);

    return (
        <Button variant="contained" color="secondary" onClick={onClick} disabled={!publicKey || !supported}>
            Sign Offchain Message
        </Button>
    );
};
