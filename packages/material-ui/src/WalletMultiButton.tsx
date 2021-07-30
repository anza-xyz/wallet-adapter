import {
    Button,
    ButtonProps,
    Collapse,
    Fade,
    ListItemIcon,
    makeStyles,
    Menu,
    MenuItem,
    Theme,
} from '@material-ui/core';
import CopyIcon from '@material-ui/icons/FileCopy';
import DisconnectIcon from '@material-ui/icons/LinkOff';
import SwitchIcon from '@material-ui/icons/SwapHoriz';
import { useWallet } from '@solana/wallet-adapter-react';
import React, { FC, useMemo, useState } from 'react';
import { useWalletDialog } from './useWalletDialog';
import { WalletConnectButton } from './WalletConnectButton';
import { WalletDialogButton } from './WalletDialogButton';
import { WalletIcon } from './WalletIcon';

const useStyles = makeStyles((theme: Theme) => ({
    root: {},
    menu: {
        '& .MuiList-root': {
            padding: 0,
        },
        '& .MuiMenuItem-root': {
            padding: theme.spacing(1, 2),
            boxShadow: 'inset 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.1)',
            '&:not(.MuiButtonBase-root)': {
                padding: 0,
                '& .MuiButton-root': {
                    borderRadius: 0,
                },
            },
            '&:hover': {
                boxShadow:
                    'inset 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.1)' + ', 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.05)',
            },
        },
        '& .MuiListItemIcon-root': {
            marginRight: theme.spacing(),
            minWidth: 'unset',
        },
    },
}));

export const WalletMultiButton: FC<ButtonProps> = ({
    color = 'primary',
    variant = 'contained',
    children,
    disabled,
    onClick,
    ...props
}) => {
    const styles = useStyles();
    const { publicKey, wallet, autoConnect, disconnect } = useWallet();
    const { setOpen } = useWalletDialog();

    const [anchor, setAnchor] = useState<HTMLElement>();

    const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);

    const content = useMemo(() => {
        if (children) return children;
        if (!wallet || !base58) return null;
        return base58.substr(0, 4) + '..' + base58.substr(-4, 4);
    }, [children, wallet, base58]);

    if (!wallet) {
        return <WalletDialogButton color={color} variant={variant} {...props} />;
    }

    if (!base58) {
        return <WalletConnectButton color={color} variant={variant} {...props} />;
    }

    return (
        <>
            <Button
                color={color}
                variant={variant}
                startIcon={<WalletIcon wallet={wallet} />}
                onClick={(event) => setAnchor(event.currentTarget)}
                aria-controls="wallet-menu"
                aria-haspopup="true"
                className={styles.root}
                {...props}
            >
                {content}
            </Button>
            <Menu
                id="wallet-menu"
                anchorEl={anchor}
                open={!!anchor}
                onClose={() => setAnchor(undefined)}
                className={styles.menu}
                marginThreshold={0}
                TransitionComponent={Fade}
                transitionDuration={250}
                keepMounted
            >
                <MenuItem onClick={() => setAnchor(undefined)} button={false}>
                    <Button
                        color={color}
                        variant={variant}
                        startIcon={<WalletIcon wallet={wallet} />}
                        className={styles.root}
                        onClick={(event) => setAnchor(undefined)}
                        fullWidth
                        {...props}
                    >
                        {wallet.name}
                    </Button>
                </MenuItem>
                <Collapse in={!!anchor}>
                    <MenuItem
                        onClick={async () => {
                            setAnchor(undefined);
                            await navigator.clipboard.writeText(base58);
                        }}
                    >
                        <ListItemIcon>
                            <CopyIcon />
                        </ListItemIcon>
                        Copy address
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            setAnchor(undefined);
                            setOpen(true);
                        }}
                    >
                        <ListItemIcon>
                            <SwitchIcon />
                        </ListItemIcon>
                        Connect a different wallet
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            setAnchor(undefined);
                            // eslint-disable-next-line @typescript-eslint/no-empty-function
                            disconnect().catch(() => {});
                        }}
                    >
                        <ListItemIcon>
                            <DisconnectIcon />
                        </ListItemIcon>
                        Disconnect
                    </MenuItem>
                </Collapse>
            </Menu>
        </>
    );
};
