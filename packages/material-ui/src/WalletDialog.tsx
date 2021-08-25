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
    makeStyles,
    Theme,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-wallets';
import React, { FC, ReactElement, SyntheticEvent, useCallback, useMemo, useState } from 'react';
import { useWalletDialog } from './useWalletDialog';
import { WalletListItem } from './WalletListItem';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        '& .MuiDialog-paper': {
            width: theme.spacing(40),
            margin: 0,
        },
        '& .MuiDialogTitle-root': {
            backgroundColor: theme.palette.primary.main,
            '& .MuiTypography-root': {
                display: 'flex',
                justifyContent: 'space-between',
                lineHeight: theme.spacing(5) + 'px',
            },
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
    },
}));

export interface WalletDialogProps extends Omit<DialogProps, 'title' | 'open'> {
    featuredWalletsNumber?: number;
    title?: ReactElement;
}

export const WalletDialog: FC<WalletDialogProps> = ({
    title = 'Select your wallet',
    featuredWalletsNumber = 2,
    onClose,
    ...props
}) => {
    const styles = useStyles();
    const { wallets, select } = useWallet();
    const { open, setOpen } = useWalletDialog();
    const [expanded, setExpanded] = useState(false);

    const [featuredWallets, otherWallets, expands] = useMemo(
        () => [
            wallets.slice(0, featuredWalletsNumber),
            wallets.slice(featuredWalletsNumber),
            wallets.length > featuredWalletsNumber,
        ],
        [wallets, featuredWalletsNumber]
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
        <Dialog open={open} onClose={handleClose} className={styles.root} {...props}>
            <DialogTitle>
                {title}
                <IconButton onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <List>
                    {featuredWallets.map((wallet) => (
                        <WalletListItem
                            key={wallet.name}
                            handleClick={(event) => handleWalletClick(event, wallet.name)}
                            wallet={wallet}
                        />
                    ))}
                    {expands && (
                        <>
                            <Collapse in={expanded} timeout="auto" unmountOnExit>
                                <List>
                                    {otherWallets.map((wallet) => (
                                        <WalletListItem
                                            key={wallet.name}
                                            handleClick={(event) => handleWalletClick(event, wallet.name)}
                                            wallet={wallet}
                                        />
                                    ))}
                                </List>
                            </Collapse>
                            <ListItem>
                                <Button onClick={handleExpandClick}>
                                    {expanded ? 'Less' : 'More'} options
                                    {expanded ? <ExpandLess /> : <ExpandMore />}
                                </Button>
                            </ListItem>
                        </>
                    )}
                </List>
            </DialogContent>
        </Dialog>
    );
};
