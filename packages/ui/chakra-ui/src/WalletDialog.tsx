import { ChevronUpIcon as CollapseIcon, ChevronDownIcon as ExpandIcon } from '@chakra-ui/icons';
import type { ModalProps } from '@chakra-ui/react';
import {
    Button,
    Collapse,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    List,
    ListItem,
    ModalOverlay,
} from '@chakra-ui/react';
import type { WalletName } from '@solana/wallet-adapter-base';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { useWallet, type Wallet } from '@solana/wallet-adapter-react';
import type { FC, ReactElement, SyntheticEvent } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import { useWalletDialog } from './useWalletDialog.js';
import { WalletListItem } from './WalletListItem.js';

// const RootDialog = styled(Dialog)(({ theme }: { theme: Theme }) => ({
//     '& .MuiDialog-paper': {
//         width: theme.spacing(40),
//         margin: 0,
//     },
//     '& .MuiDialogTitle-root': {
//         backgroundColor: theme.palette.primary.main,
//         display: 'flex',
//         justifyContent: 'space-between',
//         lineHeight: theme.spacing(5),
//         '& .MuiIconButton-root': {
//             flexShrink: 1,
//             padding: theme.spacing(),
//             marginRight: theme.spacing(-1),
//             color: theme.palette.grey[500],
//         },
//     },
//     '& .MuiDialogContent-root': {
//         padding: 0,
//         '& .MuiCollapse-root': {
//             '& .MuiList-root': {
//                 background: theme.palette.grey[900],
//             },
//         },
//         '& .MuiList-root': {
//             background: theme.palette.grey[900],
//             padding: 0,
//         },
//         '& .MuiListItem-root': {
//             boxShadow: 'inset 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.1)',
//             '&:hover': {
//                 boxShadow:
//                     'inset 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.1)' + ', 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.05)',
//             },
//             padding: 0,
//             '& .MuiButton-endIcon': {
//                 margin: 0,
//             },
//             '& .MuiButton-root': {
//                 color: theme.palette.text.primary,
//                 flexGrow: 1,
//                 justifyContent: 'space-between',
//                 padding: theme.spacing(1, 3),
//                 borderRadius: undefined,
//                 fontSize: '1rem',
//                 fontWeight: 400,
//             },
//             '& .MuiSvgIcon-root': {
//                 color: theme.palette.grey[500],
//             },
//         },
//     },
// }));

export interface WalletDialogProps extends Omit<ModalProps, 'title' | 'isOpen' | 'onClose' | 'children'> {
    featuredWallets?: number;
    title?: ReactElement;
}

export const WalletDialog: FC<WalletDialogProps> = ({
    title = 'Select your wallet',
    featuredWallets = 3,
    ...props
}) => {
    const { wallets, select } = useWallet();
    const { isOpen, onOpen, onClose } = useWalletDialog();
    const [expanded, setExpanded] = useState(false);

    const [featured, more] = useMemo(() => {
        const installed: Wallet[] = [];
        const loadable: Wallet[] = [];
        const notDetected: Wallet[] = [];

        for (const wallet of wallets) {
            if (wallet.readyState === WalletReadyState.NotDetected) {
                notDetected.push(wallet);
            } else if (wallet.readyState === WalletReadyState.Loadable) {
                loadable.push(wallet);
            } else if (wallet.readyState === WalletReadyState.Installed) {
                installed.push(wallet);
            }
        }

        const orderedWallets = [...installed, ...loadable, ...notDetected];
        return [orderedWallets.slice(0, featuredWallets), orderedWallets.slice(featuredWallets)];
    }, [wallets, featuredWallets]);

    const handleWalletClick = useCallback(
        (event: SyntheticEvent, walletName: WalletName) => {
            select(walletName);
            onClose();
        },
        [select, onClose]
    );

    const handleExpandClick = useCallback(() => setExpanded(!expanded), [setExpanded, expanded]);

    console.log('isOpen: ', isOpen);

    return (
        <Modal isOpen={isOpen} onClose={onClose} {...props} size="sm">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{title}</ModalHeader>
                <ModalBody px={0}>
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
                                <Collapse in={expanded} unmountOnExit>
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
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
