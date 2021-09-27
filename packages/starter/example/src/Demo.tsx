import { FormControlLabel, Switch, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@material-ui/core';
import {
    WalletConnectButton as AntDesignWalletConnectButton,
    WalletDisconnectButton as AntDesignWalletDisconnectButton,
    WalletModalButton as AntDesignWalletModalButton,
    WalletModalProvider as AntDesignWalletModalProvider,
    WalletMultiButton as AntDesignWalletMultiButton,
} from '@solana/wallet-adapter-ant-design';
import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import {
    WalletConnectButton as MaterialUIWalletConnectButton,
    WalletDialogButton as MaterialUIWalletDialogButton,
    WalletDialogProvider as MaterialUIWalletDialogProvider,
    WalletDisconnectButton as MaterialUIWalletDisconnectButton,
    WalletMultiButton as MaterialUIWalletMultiButton,
} from '@solana/wallet-adapter-material-ui';
import { ConnectionProvider, useLocalStorage, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletConnectButton as ReactUIWalletConnectButton,
    WalletDisconnectButton as ReactUIWalletDisconnectButton,
    WalletModalButton as ReactUIWalletModalButton,
    WalletModalProvider as ReactUIWalletModalProvider,
    WalletMultiButton as ReactUIWalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import {
    getCloverWallet,
    getLedgerWallet,
    getPhantomWallet,
    getSlopeWallet,
    getSolflareWallet,
    getSolletWallet,
    getSolletExtensionWallet,
    getTorusWallet,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useSnackbar } from 'notistack';
import React, { FC, useCallback, useMemo } from 'react';
import { version } from '../package.json';
import RequestAirdrop from './RequestAirdrop';
import SendTransaction from './SendTransaction';
import SignMessage from './SignMessage';

export const Demo: FC = () => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const [autoConnect, setAutoConnect] = useLocalStorage('autoConnect', false);

    const wallets = useMemo(
        () => [
            getCloverWallet(),
            getPhantomWallet(),
            getSlopeWallet(),
            getSolflareWallet(),
            getTorusWallet({
                options: {
                    clientId: 'BOM5Cl7PXgE9Ylq1Z1tqzhpydY0RVr8k90QQ85N7AKI5QGSrr9iDC-3rvmy0K_hF0JfpLMiXoDhta68JwcxS1LQ',
                },
            }),
            getLedgerWallet(),
            getSolletWallet({ network }),
            getSolletExtensionWallet({ network }),
        ],
        [network]
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
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} onError={onError} autoConnect={autoConnect}>
                <MaterialUIWalletDialogProvider>
                    <AntDesignWalletModalProvider>
                        <ReactUIWalletModalProvider>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell width={240}>Component</TableCell>
                                        <TableCell width={240}>Material UI</TableCell>
                                        <TableCell width={240}>Ant Design</TableCell>
                                        <TableCell width={240}>React UI</TableCell>
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
                                            <ReactUIWalletConnectButton />
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
                                            <ReactUIWalletDisconnectButton />
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
                                            <ReactUIWalletModalButton />
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
                                        <TableCell>
                                            <ReactUIWalletMultiButton />
                                        </TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell>
                                            <Tooltip
                                                title="Only runs if the wallet is ready to connect"
                                                placement="left"
                                            >
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            name="autoConnect"
                                                            color="secondary"
                                                            checked={autoConnect}
                                                            onChange={(event, checked) => setAutoConnect(checked)}
                                                        />
                                                    }
                                                    label="AutoConnect"
                                                />
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <RequestAirdrop />
                                        </TableCell>
                                        <TableCell>
                                            <SendTransaction />
                                        </TableCell>
                                        <TableCell>
                                            <SignMessage />
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </ReactUIWalletModalProvider>
                    </AntDesignWalletModalProvider>
                </MaterialUIWalletDialogProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
