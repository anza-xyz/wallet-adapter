import { CopyIcon, CloseIcon as DisconnectIcon, RepeatIcon as SwitchIcon } from '@chakra-ui/icons';
import type { ButtonProps } from '@chakra-ui/react';
import { Button, Collapse, Menu, MenuItem } from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { FC } from 'react';
import React, { useMemo, useState } from 'react';
import { useWalletDialog } from './useWalletDialog.js';
import { WalletConnectButton } from './WalletConnectButton.js';
import { WalletDialogButton } from './WalletDialogButton.js';
import { WalletIcon } from './WalletIcon.js';

export const WalletMultiButton: FC<ButtonProps> = ({
    color = 'primary',
    variant = 'contained',
    type = 'button',
    children,
    ...props
}) => {
    const { publicKey, wallet, disconnect } = useWallet();
    const { onOpen } = useWalletDialog();
    const [anchor, setAnchor] = useState<HTMLElement>();

    const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
    const content = useMemo(() => {
        if (children) return children;
        if (!wallet || !base58) return null;
        return base58.slice(0, 4) + '..' + base58.slice(-4);
    }, [children, wallet, base58]);

    if (!wallet) {
        return (
            <WalletDialogButton color={color} variant={variant} type={type} {...props}>
                {children}
            </WalletDialogButton>
        );
    }
    if (!base58) {
        return (
            <WalletConnectButton color={color} variant={variant} type={type} {...props}>
                {children}
            </WalletConnectButton>
        );
    }

    return (
        <>
            <Button
                color={color}
                variant={variant}
                type={type}
                startIcon={<WalletIcon wallet={wallet} />}
                onClick={(event) => setAnchor(event.currentTarget)}
                aria-controls="wallet-menu"
                aria-haspopup="true"
                {...props}
            >
                {content}
            </Button>
            <Menu id="wallet-menu" isOpen={!!anchor} onClose={() => setAnchor(undefined)}>
                <MenuItem onClick={() => setAnchor(undefined)}>
                    <Button
                        color={color}
                        variant={variant}
                        type={type}
                        startIcon={<WalletIcon wallet={wallet} />}
                        onClick={(event) => setAnchor(undefined)}
                        fullWidth
                        {...props}
                    >
                        {wallet.adapter.name}
                    </Button>
                </MenuItem>
                <Collapse in={!!anchor}>
                    <MenuItem
                        onClick={async () => {
                            setAnchor(undefined);
                            await navigator.clipboard.writeText(base58);
                        }}
                        icon={<CopyIcon />}
                    >
                        Copy address
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            setAnchor(undefined);
                            onOpen;
                        }}
                        icon={<SwitchIcon />}
                    >
                        Change wallet
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            setAnchor(undefined);
                            // eslint-disable-next-line @typescript-eslint/no-empty-function
                            disconnect().catch(() => {
                                // Silently catch because any errors are caught by the context `onError` handler
                            });
                        }}
                        icon={<DisconnectIcon />}
                    >
                        Disconnect
                    </MenuItem>
                </Collapse>
            </Menu>
        </>
    );
};
