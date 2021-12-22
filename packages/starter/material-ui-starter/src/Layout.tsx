import DisconnectIcon from '@mui/icons-material/LinkOff';
import { Toolbar, } from '@mui/material';
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-material-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { FC, Fragment } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { SendTransaction } from './SendTransaction';

export const Layout: FC = () => {
    const { wallet } = useWallet();

    return (
        <Fragment>
            <Toolbar style={{ display: 'flex' }}>
                <Typography component="h1" variant="h6" style={{ flexGrow: 1 }}>
                    Solana Starter App
                </Typography>
                <WalletMultiButton />
                {wallet && <WalletDisconnectButton startIcon={<DisconnectIcon />} style={{ marginLeft: 8 }} />}
            </Toolbar>
            <Grid container spacing={2} justifyContent="center"
                alignItems="center">
                <Grid item xs={2}>
                    <Card raised>
                        <CardContent>
                            <Typography variant="h5" component="div">
                                Send Transaction Demo
                            </Typography>
                            <Typography variant="body2">
                                <ol>
                                    <li>Make sure you've set the network of your wallet in your browser extension / add-in to devnet.</li>
                                    <li>Click the purple Select Wallet button to connect your wallet.</li>
                                    <li>The button below should become clickable.</li>
                                    <li>Click the button to send 1 lamport to a random devnet address.</li>
                                    <li>Your wallet should ask for your approval.</li>
                                    <li>Once granted, you should see two notifications, one for the transaction being sent
                                        and another confirming it was successful.</li>
                                </ol>
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Grid container spacing={2} justifyContent="center"
                                alignItems="center">
                                <Grid item>
                                    <SendTransaction />
                                </Grid>
                            </Grid>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>
        </Fragment >
    );
};
