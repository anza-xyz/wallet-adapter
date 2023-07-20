import {
    // FIXME(https://github.com/mui/material-ui/issues/35233)
    FileCopy as CopyIcon,
    // FIXME(https://github.com/mui/material-ui/issues/35233)
    LinkOff as DisconnectIcon,
    // FIXME(https://github.com/mui/material-ui/issues/35233)
    SwapHoriz as SwitchIcon,
} from '@mui/icons-material';
import type { ButtonProps, Theme } from '@mui/material';
import { Collapse, Fade, ListItemIcon, Menu, MenuItem, styled } from '@mui/material';

import { useWalletMultiButton } from '@solana/wallet-adapter-base-ui';
import React, { useMemo, useState } from 'react';
import { BaseWalletConnectionButton } from './BaseWalletConnectionButton.js';
import { useWalletDialog } from './useWalletDialog.js';

const StyledMenu = styled(Menu)(({ theme }: { theme: Theme }) => ({
    '& .MuiList-root': {
        padding: 0,
    },
    '& .MuiListItemIcon-root': {
        marginRight: theme.spacing(),
        minWidth: 'unset',
        '& .MuiSvgIcon-root': {
            width: 20,
            height: 20,
        },
    },
}));

const WalletActionMenuItem = styled(MenuItem)(({ theme }: { theme: Theme }) => ({
    padding: theme.spacing(1, 2),
    boxShadow: 'inset 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.1)',

    '&:hover': {
        boxShadow: 'inset 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.1)' + ', 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.05)',
    },
}));

const WalletMenuItem = styled(WalletActionMenuItem)(() => ({
    padding: 0,

    '& .MuiButton-root': {
        borderRadius: 0,
    },
}));

type Props = ButtonProps & {
    labels: Omit<
        { [TButtonState in ReturnType<typeof useWalletMultiButton>['buttonState']]: string },
        'connected' | 'disconnecting'
    > & {
        'copy-address': string;
        'change-wallet': string;
        disconnect: string;
    };
};

export function BaseWalletMultiButton({ children, labels, ...props }: Props) {
    const { setOpen: setModalVisible } = useWalletDialog();
    const anchorRef = React.createRef<HTMLButtonElement>();
    const [menuOpen, setMenuOpen] = useState(false);
    const { buttonState, onConnect, onDisconnect, publicKey, walletIcon, walletName } = useWalletMultiButton({
        onSelectWallet() {
            setModalVisible(true);
        },
    });
    const content = useMemo(() => {
        if (children) {
            return children;
        } else if (publicKey) {
            const base58 = publicKey.toBase58();
            return base58.slice(0, 4) + '..' + base58.slice(-4);
        } else if (buttonState === 'connecting' || buttonState === 'has-wallet') {
            return labels[buttonState];
        } else {
            return labels['no-wallet'];
        }
    }, [buttonState, children, labels, publicKey]);
    return (
        <>
            <BaseWalletConnectionButton
                {...props}
                aria-controls="wallet-menu"
                aria-haspopup="true"
                onClick={() => {
                    switch (buttonState) {
                        case 'no-wallet':
                            setModalVisible(true);
                            break;
                        case 'has-wallet':
                            if (onConnect) {
                                onConnect();
                            }
                            break;
                        case 'connected':
                            setMenuOpen(true);
                            break;
                    }
                }}
                ref={anchorRef}
                walletIcon={walletIcon}
                walletName={walletName}
            >
                {content}
            </BaseWalletConnectionButton>
            <StyledMenu
                id="wallet-menu"
                anchorEl={
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    () => anchorRef.current!
                }
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                marginThreshold={0}
                TransitionComponent={Fade}
                transitionDuration={250}
                keepMounted
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <WalletMenuItem onClick={() => setMenuOpen(false)}>
                    <BaseWalletConnectionButton
                        {...props}
                        fullWidth
                        onClick={() => setMenuOpen(false)}
                        walletIcon={walletIcon}
                        walletName={walletName}
                    >
                        {walletName}
                    </BaseWalletConnectionButton>
                </WalletMenuItem>
                <Collapse in={menuOpen}>
                    {publicKey ? (
                        <WalletActionMenuItem
                            onClick={async () => {
                                setMenuOpen(false);
                                await navigator.clipboard.writeText(publicKey.toBase58());
                            }}
                        >
                            <ListItemIcon>
                                <CopyIcon />
                            </ListItemIcon>
                            {labels['copy-address']}
                        </WalletActionMenuItem>
                    ) : null}
                    <WalletActionMenuItem
                        onClick={() => {
                            setMenuOpen(false);
                            setModalVisible(true);
                        }}
                    >
                        <ListItemIcon>
                            <SwitchIcon />
                        </ListItemIcon>
                        {labels['change-wallet']}
                    </WalletActionMenuItem>
                    {onDisconnect ? (
                        <WalletActionMenuItem
                            onClick={() => {
                                setMenuOpen(false);
                                onDisconnect();
                            }}
                        >
                            <ListItemIcon>
                                <DisconnectIcon />
                            </ListItemIcon>
                            {labels['disconnect']}
                        </WalletActionMenuItem>
                    ) : null}
                </Collapse>
            </StyledMenu>
        </>
    );
}
