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
    getSolletWallet,
    getSolongWallet,
    getTorusWallet,
    getSolflareWallet,
} from '@solana/wallet-adapter-wallets';
import { useSnackbar } from 'notistack';
import React, { FC, useCallback, useMemo } from 'react';

const Wallet: FC = () => {
    const [autoConnect, setAutoConnect] = useLocalStorage('autoConnect', false);

    const wallets = useMemo(
        () => [
            getSolflareWallet(),
            getPhantomWallet(),
            getTorusWallet({
                clientId: 'BOM5Cl7PXgE9Ylq1Z1tqzhpydY0RVr8k90QQ85N7AKI5QGSrr9iDC-3rvmy0K_hF0JfpLMiXoDhta68JwcxS1LQ',
            }),
            getLedgerWallet(),
            getSolongWallet(),
            getMathWallet(),
            getSolletWallet(),
            // getWalletConnectWallet(), // @FIXME
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
        <WalletProvider wallets={wallets} onError={onError} autoConnect>
            <WalletDialogProvider>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell width={200}>Component</TableCell>
                            <TableCell>Demo</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>WalletConnectButton</TableCell>
                            <TableCell>
                                <WalletConnectButton />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>WalletDisconnectButton</TableCell>
                            <TableCell>
                                <WalletDisconnectButton />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>WalletDialogButton</TableCell>
                            <TableCell>
                                <WalletDialogButton />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>WalletMultiButton</TableCell>
                            <TableCell>
                                <WalletMultiButton />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>
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
