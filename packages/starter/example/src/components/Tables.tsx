import { FormControlLabel, Switch, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@mui/material';
import React, { type FC } from 'react';

import {
    WalletConnectButton,
    WalletDisconnectButton,
    WalletModalButton,
    WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';

import pkg from '../../package.json';
import { SendLegacyTransaction } from '../components/SendLegacyTransaction';
import { SendTransaction } from '../components/SendTransaction';
import { SendV0Transaction } from '../components/SendV0Transaction';
import { SignIn } from '../components/SignIn';
import { SignMessage } from '../components/SignMessage';
import { SignTransaction } from '../components/SignTransaction';
import { useAutoConnect } from './AutoConnectProvider';
import { RequestAirdrop } from './RequestAirdrop';

export const Tables: FC = () => {
    const { autoConnect, setAutoConnect } = useAutoConnect();

    return (
        <>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell width={240}>Component</TableCell>
                        <TableCell width={240}>React UI</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>Connect Button</TableCell>
                        <TableCell>
                            <WalletConnectButton />
                        </TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Disconnect Button</TableCell>
                        <TableCell>
                            <WalletDisconnectButton />
                        </TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Dialog/Modal Button</TableCell>
                        <TableCell>
                            <WalletModalButton />
                        </TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Multi Button</TableCell>
                        <TableCell>
                            <WalletMultiButton />
                        </TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell width={240}>Example v{pkg.version}</TableCell>
                        <TableCell width={240}>
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
                        <TableCell width={240}>
                            <RequestAirdrop />
                        </TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <SignMessage />
                        </TableCell>
                        <TableCell>
                            <SignIn />
                        </TableCell>
                        <TableCell>
                            <SignTransaction />
                        </TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <SendTransaction />
                        </TableCell>
                        <TableCell>
                            <SendLegacyTransaction />
                        </TableCell>
                        <TableCell>
                            <SendV0Transaction />
                        </TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </>
    );
};
