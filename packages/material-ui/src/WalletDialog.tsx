import {
    Button,
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
import { useWallet } from '@solana/wallet-adapter-react';
import React, { FC, ReactElement, SyntheticEvent, useCallback } from 'react';
import { useWalletDialog } from './useWalletDialog';
import { WalletIcon } from './WalletIcon';

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
            '& .MuiList-root': {
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
                    fontWeight: 300,
                },
            },
        },
    },
}));

export interface WalletDialogProps extends Omit<DialogProps, 'title' | 'open'> {
    title?: ReactElement;
}

export const WalletDialog: FC<WalletDialogProps> = ({ title = 'Select your wallet', onClose, ...props }) => {
    const styles = useStyles();
    const { wallets, select } = useWallet();
    const { open, setOpen } = useWalletDialog();

    const handleClose = useCallback(
        (event: SyntheticEvent, reason?: 'backdropClick' | 'escapeKeyDown') => {
            if (onClose) onClose(event, reason!);
            if (!event.defaultPrevented) setOpen(false);
        },
        [setOpen, onClose]
    );

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
                    {wallets.map((wallet) => (
                        <ListItem key={wallet.name}>
                            <Button
                                onClick={(event) => {
                                    select(wallet.name);
                                    handleClose(event);
                                }}
                                endIcon={<WalletIcon wallet={wallet} />}
                            >
                                {wallet.name}
                            </Button>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
};
