import { FormControlLabel, Switch, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@material-ui/core';
import {
    WalletConnectButton as AntDesignWalletConnectButton,
    WalletDisconnectButton as AntDesignWalletDisconnectButton,
    WalletModalButton as AntDesignWalletModalButton,
    WalletModalProvider as AntDesignWalletModalProvider,
    WalletMultiButton as AntDesignWalletMultiButton,
    ConnectionModalProvider as AntDesignConnectionModalProvider,
} from '@solana/wallet-adapter-ant-design';
import {
    WalletConnectButton as MaterialUIWalletConnectButton,
    WalletDialogButton as MaterialUIWalletDialogButton,
    WalletDialogProvider as MaterialUIWalletDialogProvider,
    WalletDisconnectButton as MaterialUIWalletDisconnectButton,
    WalletMultiButton as MaterialUIWalletMultiButton,
} from '@solana/wallet-adapter-material-ui';
import {
    WalletConnectButton as ReactUIWalletConnectButton,
    WalletDisconnectButton as ReactUIWalletDisconnectButton,
    WalletModalButton as ReactUIWalletModalButton,
    WalletModalProvider as ReactUIWalletModalProvider,
    WalletMultiButton as ReactUIWalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import { NextPage } from 'next';
import pkg from '../package.json';
import { useAutoConnect } from '../components/AutoConnectProvider';
import RequestAirdrop from '../components/RequestAirdrop';
import SendTransaction from '../components/SendTransaction';
import SignMessage from '../components/SignMessage';
import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

const Index: NextPage = () => {
    const { autoConnect, setAutoConnect } = useAutoConnect();

    return (
        <MaterialUIWalletDialogProvider>
            <AntDesignWalletModalProvider>
                <AntDesignConnectionModalProvider
                    connections={[
                        {
                            endpoint: clusterApiUrl(WalletAdapterNetwork.Mainnet),
                            name: 'Mainnet',
                        },
                        {
                            endpoint: clusterApiUrl(WalletAdapterNetwork.Devnet),
                            name: 'Devnet',
                        },
                        {
                            endpoint: clusterApiUrl(WalletAdapterNetwork.Testnet),
                            name: 'Testnet',
                        },
                    ]}
                >
                    <ReactUIWalletModalProvider>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell width={240}>Component</TableCell>
                                    <TableCell width={240}>Material UI</TableCell>
                                    <TableCell width={240}>Ant Design</TableCell>
                                    <TableCell width={240}>React UI</TableCell>
                                    <TableCell>Example v{pkg.version}</TableCell>
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
                                        <Tooltip title="Only runs if the wallet is ready to connect" placement="left">
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
                </AntDesignConnectionModalProvider>
            </AntDesignWalletModalProvider>
        </MaterialUIWalletDialogProvider>
    );
};

export default Index;
