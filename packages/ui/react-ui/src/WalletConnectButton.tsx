import { useWallet } from '@solana/wallet-adapter-react';
import type { FC, MouseEventHandler } from 'react';
import React, { useCallback, useMemo } from 'react';
import type { ButtonProps } from './Button.js';
import { Button } from './Button.js';
import { WalletIcon } from './WalletIcon.js';
import { DemonWalletName } from './Constant.js';

export const WalletConnectButton: FC<ButtonProps> = ({ children, disabled, onClick, ...props }) => {
    const { wallet, connect, connecting, connected, select } = useWallet();

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        (event) => {
            if (onClick) onClick(event);
            if (!event.defaultPrevented) {
                select(DemonWalletName);
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                connect().catch(() => {});
            }
        },
        [onClick, connect, select]
    );

    const content = useMemo(() => {
        if (children) return children;
        if (connecting) return 'Connecting ...';
        if (connected) return 'Connected';
        if (wallet) return 'Connect';
        return 'Connect Wallet';
    }, [children, connecting, connected, wallet]);

    return (
        <Button
            className="wallet-adapter-button-trigger"
            disabled={disabled || !wallet || connecting || connected}
            startIcon={wallet ? <WalletIcon wallet={wallet} /> : undefined}
            onClick={handleClick}
            {...props}
        >
            {content}
        </Button>
    );
};
