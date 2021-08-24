import { useWallet } from '@solana/wallet-adapter-react';
import React, { FC, MouseEventHandler, useCallback, useMemo } from 'react';
import { Button, ButtonProps } from './Button';
import { WalletIcon } from './WalletIcon';

export const WalletConnectButton: FC<ButtonProps> = ({ color, children, disabled, onClick, ...props }) => {
    const { wallet, connect, connecting, connected } = useWallet();

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        (event) => {
            if (onClick) onClick(event);
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            if (!event.defaultPrevented) connect().catch(() => {});
        },
        [onClick, connect]
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
            color={color}
            onClick={handleClick}
            disabled={disabled || !wallet || connecting || connected}
            icon={<WalletIcon wallet={wallet} />}
            style={{}}
        >
            {content}
        </Button>
    );
};
