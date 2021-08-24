import { FormControlLabel, Switch, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@material-ui/core';
import { WalletError } from '@solana/wallet-adapter-base';
import {
    WalletConnectButton as MaterialUIWalletConnectButton,
    WalletDialogButton as MaterialUIWalletDialogButton,
    WalletDialogProvider as MaterialUIWalletDialogProvider,
    WalletDisconnectButton as MaterialUIWalletDisconnectButton,
    WalletMultiButton as MaterialUIWalletMultiButton,
} from '@solana/wallet-adapter-material-ui';
import {
    WalletConnectButton as AntDesignWalletConnectButton,
    WalletModalButton as AntDesignWalletModalButton,
    WalletModalProvider as AntDesignWalletModalProvider,
    WalletDisconnectButton as AntDesignWalletDisconnectButton,
    WalletMultiButton as AntDesignWalletMultiButton,
} from '@solana/wallet-adapter-ant-design';
import {
    WalletConnectButton as PhantomUIWalletConnectButton,
    WalletModalButton as PhantomUIWalletModalButton,
    WalletModalProvider as PhantomUIWalletModalProvider,
    WalletDisconnectButton as PhantomUIWalletDisconnectButton,
    // WalletMultiButton as PhantomUIWalletMultiButton,
} from '@solana/wallet-adapter-phantom-ui';
import { useLocalStorage, WalletProvider } from '@solana/wallet-adapter-react';
import {
    getLedgerWallet,
    getMathWallet,
    getPhantomWallet,
    getSolflareWallet,
    getSolflareWebWallet,
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
            getSolflareWallet(),
            getTorusWallet({
                options: {
                    clientId: 'BOM5Cl7PXgE9Ylq1Z1tqzhpydY0RVr8k90QQ85N7AKI5QGSrr9iDC-3rvmy0K_hF0JfpLMiXoDhta68JwcxS1LQ',
                },
            }),
            getLedgerWallet(),
            getSolongWallet(),
            getMathWallet(),
            getSolletWallet(),
            getSolflareWebWallet(),
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
            <MaterialUIWalletDialogProvider>
                <AntDesignWalletModalProvider>
                    <PhantomUIWalletModalProvider>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell width={200}>Component</TableCell>
                                    <TableCell width={200}>Material UI</TableCell>
                                    <TableCell width={200}>Ant Design</TableCell>
                                    <TableCell width={200}>Phantom</TableCell>
                                    <TableCell>Example v{version}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Connect Button</TableCell>
                                    <TableCell>
                                        <MaterialUIWalletConnectButton />
                                    </TableCell>
                                    <TableCell>
                                        <AntDesignWalletConnectButton />
                                    </TableCell>
                                    <TableCell>
                                        <PhantomUIWalletConnectButton />
                                    </TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Disconnect Button</TableCell>
                                    <TableCell>
                                        <MaterialUIWalletDisconnectButton />
                                    </TableCell>
                                    <TableCell>
                                        <AntDesignWalletDisconnectButton />
                                    </TableCell>
                                    <TableCell>
                                        <PhantomUIWalletDisconnectButton />
                                    </TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Dialog/Modal Button</TableCell>
                                    <TableCell>
                                        <MaterialUIWalletDialogButton />
                                    </TableCell>
                                    <TableCell>
                                        <AntDesignWalletModalButton />
                                    </TableCell>
                                    <TableCell>
                                        <PhantomUIWalletModalButton />
                                    </TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Multi Button</TableCell>
                                    <TableCell>
                                        <MaterialUIWalletMultiButton />
                                    </TableCell>
                                    <TableCell>
                                        <AntDesignWalletMultiButton />
                                    </TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell colSpan={3}>
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
                    </PhantomUIWalletModalProvider>
                </AntDesignWalletModalProvider>
            </MaterialUIWalletDialogProvider>
        </WalletProvider>
    );
};

export default Wallet;
