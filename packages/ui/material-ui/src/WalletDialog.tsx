import { Close as CloseIcon, ExpandLess as CollapseIcon, ExpandMore as ExpandIcon } from '@mui/icons-material';
import {
    Button,
    Collapse,
    Dialog,
    DialogContent,
    DialogProps,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    Theme,
} from '@mui/material';
import { styled } from '@mui/material';
import { WalletName } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import React, { FC, ReactElement, SyntheticEvent, useCallback, useMemo, useState } from 'react';
import { useWalletDialog } from './useWalletDialog';
import { WalletListItem } from './WalletListItem';

const RootDialog = styled(Dialog)(({ theme }: { theme: Theme }) => ({
    '& .MuiDialog-paper': {
        width: theme.spacing(40),
        margin: 0,
    },
    '& .MuiDialogTitle-root': {
        backgroundColor: theme.palette.primary.main,
        display: 'flex',
        justifyContent: 'space-between',
        lineHeight: theme.spacing(5),
        '& .MuiIconButton-root': {
            flexShrink: 1,
            padding: theme.spacing(),
            marginRight: theme.spacing(-1),
            color: theme.palette.grey[500],
        },
    },
    '& .MuiDialogContent-root': {
        padding: 0,
        '& .MuiCollapse-root': {
            '& .MuiList-root': {
                background: theme.palette.grey[900],
            },
        },
        '& .MuiList-root': {
            background: theme.palette.grey[900],
            padding: 0,
        },
        '& .MuiListItem-root': {
            boxShadow: 'inset 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
                boxShadow:
                    'inset 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.1)' + ', 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.05)',
            },
            padding: 0,
            '& .MuiButton-endIcon': {
                margin: 0,
            },
            '& .MuiButton-root': {
                color: theme.palette.text.primary,
                flexGrow: 1,
                justifyContent: 'space-between',
                padding: theme.spacing(1, 3),
                borderRadius: undefined,
                fontSize: '1rem',
                fontWeight: 400,
            },
            '& .MuiSvgIcon-root': {
                color: theme.palette.grey[500],
            },
        },
    },
}));

export interface WalletDialogProps extends Omit<DialogProps, 'title' | 'open'> {
    featuredWallets?: number;
    title?: ReactElement;
}

export const WalletDialog: FC<WalletDialogProps> = ({
    title = 'Select your wallet',
    featuredWallets = 3,
    onClose,
    ...props
}) => {
    const { wallets, select } = useWallet();
    const { open, setOpen } = useWalletDialog();
    const [expanded, setExpanded] = useState(false);

    const [featured, more] = useMemo(
        () => [wallets.slice(0, featuredWallets), wallets.slice(featuredWallets)],
        [wallets, featuredWallets]
    );

    const handleClose = useCallback(
        (event: SyntheticEvent, reason?: 'backdropClick' | 'escapeKeyDown') => {
            if (onClose) onClose(event, reason!);
            if (!event.defaultPrevented) setOpen(false);
        },
        [setOpen, onClose]
    );

    const handleWalletClick = useCallback(
        (event: SyntheticEvent, walletName: WalletName) => {
            select(walletName);
            handleClose(event);
        },
        [select, handleClose]
    );

    const handleExpandClick = useCallback(() => setExpanded(!expanded), [setExpanded, expanded]);

    return (
        <RootDialog open={open} onClose={handleClose} {...props}>
            <DialogTitle>
                {title}
                <IconButton onClick={handleClose} size="large">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <List>
                    {featured.map((wallet) => (
                        <WalletListItem
                            key={wallet.adapter.name}
                            onClick={(event) => handleWalletClick(event, wallet.adapter.name)}
                            wallet={wallet}
                        />
                    ))}
                    {more.length ? (
                        <>
                            <Collapse in={expanded} timeout="auto" unmountOnExit>
                                <List>
                                    {more.map((wallet) => (
                                        <WalletListItem
                                            key={wallet.adapter.name}
                                            onClick={(event) => handleWalletClick(event, wallet.adapter.name)}
                                            wallet={wallet}
                                        />
                                    ))}
                                </List>
                            </Collapse>
                            <ListItem>
                                <Button onClick={handleExpandClick}>
                                    {expanded ? 'Less' : 'More'} options
                                    {expanded ? <CollapseIcon /> : <ExpandIcon />}
                                </Button>
                            </ListItem>
                        </>
                    ) : null}
                </List>
            </DialogContent>
        </RootDialog>
    );
};
