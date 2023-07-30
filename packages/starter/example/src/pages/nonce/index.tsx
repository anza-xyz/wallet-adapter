import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';
import { SendNonceTransaction } from '../../components/nonce/SendNonceTransaction';

const WalletMultiButton = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

const RequestAirdropDynamic = dynamic(async () => (await import('../../components/RequestAirdrop')).RequestAirdrop, {
    ssr: false,
});

const InitiateNonce = dynamic(async () => (await import('../../components/nonce/InitiateNonce')).InitiateNonce, {
    ssr: false,
});

const Index: NextPage = () => {


    return (
        <div style={{ width: '100%' }}>
            <Table style={{ width: 400, margin: 'auto' }}>
                <TableHead>
                <TableRow>
                        <TableCell width={600} colSpan={3}>Nonce Wallet Adapter Test</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                <TableRow>
                        <TableCell width={150}>Wallet Multi</TableCell>
                        <TableCell width={450} colSpan={2}><WalletMultiButton /></TableCell>
                    </TableRow>
               <TableRow>
                    <TableCell width={150}>Airdrop</TableCell>
                    <TableCell width={450} colSpan={2}><RequestAirdropDynamic /></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell width={150}>Init Nonce</TableCell>
                    <TableCell width={450} colSpan={2}><InitiateNonce /></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell width={150}>Send Tx w/ Nonce</TableCell>
                    <TableCell width={450} colSpan={2}><SendNonceTransaction /></TableCell>
                </TableRow>
                </TableBody>
            </Table>
        </div>
    );
};

export default Index;