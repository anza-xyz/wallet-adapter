import { FormControlLabel, Switch, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@mui/material';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';
import pkg from '../../package.json';
import { useAutoConnect } from '../components/AutoConnectProvider';

const AntDesignWalletConnectButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-ant-design')).WalletConnectButton,
    { ssr: false }
);
const AntDesignWalletDisconnectButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-ant-design')).WalletDisconnectButton,
    { ssr: false }
);
const AntDesignWalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-ant-design')).WalletMultiButton,
    { ssr: false }
);
const AntDesignWalletModalButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-ant-design')).WalletModalButton,
    { ssr: false }
);

const MaterialUIWalletConnectButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-material-ui')).WalletConnectButton,
    { ssr: false }
);
const MaterialUIWalletDisconnectButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-material-ui')).WalletDisconnectButton,
    { ssr: false }
);
const MaterialUIWalletDialogButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-material-ui')).WalletDialogButton,
    { ssr: false }
);
const MaterialUIWalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-material-ui')).WalletMultiButton,
    { ssr: false }
);

const ReactUIWalletConnectButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletConnectButton,
    { ssr: false }
);
const ReactUIWalletDisconnectButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletDisconnectButton,
    { ssr: false }
);
const ReactUIWalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);
const ReactUIWalletModalButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletModalButton,
    { ssr: false }
);

const RequestAirdropDynamic = dynamic(async () => (await import('../components/RequestAirdrop')).RequestAirdrop, {
    ssr: false,
});
const SendLegacyTransactionDynamic = dynamic(
    async () => (await import('../components/SendLegacyTransaction')).SendLegacyTransaction,
    { ssr: false }
);
const SendTransactionDynamic = dynamic(async () => (await import('../components/SendTransaction')).SendTransaction, {
    ssr: false,
});
const SendV0TransactionDynamic = dynamic(
    async () => (await import('../components/SendV0Transaction')).SendV0Transaction,
    { ssr: false }
);
const SignInDynamic = dynamic(async () => (await import('../components/SignIn')).SignIn, { ssr: false });
const SignMessageDynamic = dynamic(async () => (await import('../components/SignMessage')).SignMessage, { ssr: false });
const SignTransactionDynamic = dynamic(async () => (await import('../components/SignTransaction')).SignTransaction, {
    ssr: false,
});

const Index: NextPage = () => {
    const { autoConnect, setAutoConnect } = useAutoConnect();

    return (
        <>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell width={240}>Component</TableCell>
                        <TableCell width={240}>Material UI</TableCell>
                        <TableCell width={240}>Ant Design</TableCell>
                        <TableCell width={240}>React UI</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>Connect Button</TableCell>
                        <TableCell>
                            <MaterialUIWalletConnectButtonDynamic />
                        </TableCell>
                        <TableCell>
                            <AntDesignWalletConnectButtonDynamic />
                        </TableCell>
                        <TableCell>
                            <ReactUIWalletConnectButtonDynamic />
                        </TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Disconnect Button</TableCell>
                        <TableCell>
                            <MaterialUIWalletDisconnectButtonDynamic />
                        </TableCell>
                        <TableCell>
                            <AntDesignWalletDisconnectButtonDynamic />
                        </TableCell>
                        <TableCell>
                            <ReactUIWalletDisconnectButtonDynamic />
                        </TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Dialog/Modal Button</TableCell>
                        <TableCell>
                            <MaterialUIWalletDialogButtonDynamic />
                        </TableCell>
                        <TableCell>
                            <AntDesignWalletModalButtonDynamic />
                        </TableCell>
                        <TableCell>
                            <ReactUIWalletModalButtonDynamic />
                        </TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Multi Button</TableCell>
                        <TableCell>
                            <MaterialUIWalletMultiButtonDynamic />
                        </TableCell>
                        <TableCell>
                            <AntDesignWalletMultiButtonDynamic />
                        </TableCell>
                        <TableCell>
                            <ReactUIWalletMultiButtonDynamic />
                        </TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <br />
            <br />
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell width={240}>Example v{pkg.version}</TableCell>
                        <TableCell width={240}></TableCell>
                        <TableCell width={240}></TableCell>
                        <TableCell width={240}></TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
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
                            <RequestAirdropDynamic />
                        </TableCell>
                        <TableCell>
                            <SignTransactionDynamic />
                        </TableCell>
                        <TableCell>
                            <SignMessageDynamic />
                        </TableCell>
                        <TableCell>
                            <SignInDynamic />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>
                            <SendTransactionDynamic />
                        </TableCell>
                        <TableCell>
                            <SendLegacyTransactionDynamic />
                        </TableCell>
                        <TableCell>
                            <SendV0TransactionDynamic />
                        </TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </>
    );
};

export default Index;
