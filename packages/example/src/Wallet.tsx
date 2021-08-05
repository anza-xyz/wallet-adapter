import { FormControlLabel, Switch, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@material-ui/core';
import { WalletError } from '@solana/wallet-adapter-base';
import {
    WalletConnectButton,
    WalletDialogButton,
    WalletDialogProvider,
    WalletDisconnectButton,
    WalletMultiButton,
} from '@solana/wallet-adapter-material-ui';
import { useLocalStorage, WalletProvider } from '@solana/wallet-adapter-react';
import {
    getLedgerWallet,
    getMathWallet,
    getPhantomWallet,
    getSolflareWallet,
    getSolletWallet,
    getSolongWallet,
    getTorusWallet,
} from '@solana/wallet-adapter-wallets';
import { useSnackbar } from 'notistack';
import React, { FC, useCallback, useMemo } from 'react';
import { version } from '../package.json';

const Wallet: FC = () => {
    const [autoConnect, setAutoConnect] = useLocalStorage('autoConnect', false);

    const wallets = useMemo(
        () => [
            getPhantomWallet(),
            getTorusWallet({
                options: {
                    clientId: 'BOM5Cl7PXgE9Ylq1Z1tqzhpydY0RVr8k90QQ85N7AKI5QGSrr9iDC-3rvmy0K_hF0JfpLMiXoDhta68JwcxS1LQ',
                },
            }),
            getLedgerWallet(),
            getSolongWallet(),
            getMathWallet(),
            getSolletWallet(),
            getSolflareWallet(),
        ],
        []
    );

    const { enqueueSnackbar } = useSnackbar();
    const onError = useCallback(
        (error: WalletError) => {
            enqueueSnackbar(error.message ? `${error.name}: ${error.message}` : error.name, { variant: 'error' });
            console.error(error);
        },
        [enqueueSnackbar]
    );

    return (
        <WalletProvider wallets={wallets} onError={onError} autoConnect={autoConnect}>
            <WalletDialogProvider>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell width={200}>Component</TableCell>
                            <TableCell width={200}>Demo</TableCell>
                            <TableCell>Example v{version}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>WalletConnectButton</TableCell>
                            <TableCell colSpan={2}>
                                <WalletConnectButton />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>WalletDisconnectButton</TableCell>
                            <TableCell colSpan={2}>
                                <WalletDisconnectButton />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>WalletDialogButton</TableCell>
                            <TableCell colSpan={2}>
                                <WalletDialogButton />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>WalletMultiButton</TableCell>
                            <TableCell colSpan={2}>
                                <WalletMultiButton />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell colSpan={2}>
                                <Tooltip title="Only runs if the wallet is ready to connect" placement="left">
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                name="autoConnect"
                                                color="primary"
                                                checked={autoConnect}
                                                onChange={(event, checked) => setAutoConnect(checked)}
                                            />
                                        }
                                        label="AutoConnect"
                                    />
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </WalletDialogProvider>
        </WalletProvider>
    );
};

export default Wallet;
