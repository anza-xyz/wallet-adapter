import { Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React, { useState, useMemo } from 'react';
import { TestResult } from '../components/RunNonceTest';
import { formatNumber } from '../utils/helpers';

const WalletMultiButton = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

const RunNonceTest = dynamic(
    async () => (await import('../components/RunNonceTest')).RunNonceTest,
    { ssr: false }
);

const RequestAirdropDynamic = dynamic(async () => (await import('../components/RequestAirdrop')).RequestAirdrop, {
    ssr: false,
});

const InitiateNonce = dynamic(async () => (await import('../components/InitiateNonce')).InitiateNonce, {
    ssr: false,
});

export interface Result {
    id: number;
    nonceDuration?: number;
    blockhashDuration?: number;
}

const Index: NextPage = () => {
    const { connected } = useWallet();
    const [results, setResults] = useState<Array<Result>>([]);
    const [showAverage, setShowAverage] = useState(false);
    const [running, setRunning] = useState(false);

    const handleLoopComplete = (result: TestResult) => {
        setResults(prevResults => {
            let existingResult = prevResults.find(r => r.id === result.id);
            if (existingResult) {
                // Update existing result with new duration
                return prevResults.map(r => r.id === result.id ? { ...r, [`${result.type.toLowerCase()}Duration`]: result.duration } : r);
            } else {
                // Add new result
                return [...prevResults, { id: result.id, [`${result.type.toLowerCase()}Duration`]: result.duration }];
            }
        });
    }

    const nonceAverage = useMemo(() => {
        const total = results.reduce((acc, result) => acc + (result.nonceDuration || 0), 0);
        return formatNumber(total / results.length);
    }, [results]);

    const blockhashAverage = useMemo(() => {
        const total = results.reduce((acc, result) => acc + (result.blockhashDuration || 0), 0);
        return formatNumber(total / results.length);
    }, [results]);


    return (
        <div style={{ width: '100%' }}>
            <Table style={{ width: 400, margin: 'auto' }}>
                <TableHead>
                    <TableRow>
                        <TableCell width={150}>Nonce Test</TableCell>
                        <TableCell width={450} colSpan={2}><WalletMultiButton /></TableCell>
                    </TableRow>
                </TableHead>
                {/* Airdrop if Balance = 0 */}
                <TableRow>
                    <TableCell width={150}>Airdrop</TableCell>
                    <TableCell width={450} colSpan={2}><RequestAirdropDynamic /></TableCell>
                </TableRow>
                {/* Init Turbo if Balance > 0 &&  */}
                <TableRow>
                    <TableCell width={150}>Init Nonce</TableCell>
                    <TableCell width={450} colSpan={2}><InitiateNonce/></TableCell>
                </TableRow>
                <TableBody>
                    {connected && !running && <TableRow>
                        <TableCell width={600} colSpan={3} style={{ textAlign: 'center' }}>
                            <RunNonceTest
                                onStart={() => setRunning(true)}
                                onLoopComplete={handleLoopComplete}
                                onTestComplete={() => {
                                    setShowAverage(true)
                                    setRunning(false)
                                }}
                                running
                            />
                        </TableCell>
                    </TableRow>}
                    {results.length > 0 &&
                        <TableRow>
                            <TableCell width={50} style={{ textAlign: 'center', fontWeight: 'bold' }}>ID</TableCell>
                            <TableCell width={275} style={{ textAlign: 'center', fontWeight: 'bold' }}>Nonce Tests</TableCell>
                            <TableCell width={275} style={{ textAlign: 'center', fontWeight: 'bold' }}>Blockhash Tests</TableCell>
                        </TableRow>}
                    {results.map(result => (
                        <TableRow key={result.id}>
                            <TableCell width={50} style={{ textAlign: 'center' }}>{result.id}</TableCell>
                            <TableCell width={275} style={{ textAlign: 'center' }}>{result.nonceDuration ? formatNumber(result.nonceDuration) : 'Processing...'}</TableCell>
                            <TableCell width={275} style={{ textAlign: 'center' }}>{result.blockhashDuration ? formatNumber(result.blockhashDuration) : 'Processing...'}</TableCell>
                        </TableRow>
                    ))}

                    {showAverage && <>

                        <TableRow>
                            <TableCell width={50} style={{ textAlign: 'center', fontWeight: 'bold' }}>Avg: </TableCell>
                            <TableCell width={275} style={{ textAlign: 'center', fontWeight: 'bold' }}>{nonceAverage}</TableCell>
                            <TableCell width={275} style={{ textAlign: 'center', fontWeight: 'bold' }}>{blockhashAverage}</TableCell>
                        </TableRow>
                    </>}
                </TableBody>
            </Table>

        </div>

    );
};

export default Index;
