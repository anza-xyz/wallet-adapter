import { useWallet } from '@solana/wallet-adapter-react';
import React, { FC, useMemo, useRef, useState } from 'react';
import { useOnClickOutside } from './hooks';
import { useWalletModal } from './useWalletModal';
import { Button, ButtonProps } from './Button';
import { WalletConnectButton } from './WalletConnectButton';
import { WalletIcon } from './WalletIcon';
import { WalletModalButton } from './WalletModalButton';

export const WalletMultiButton: FC<ButtonProps> = ({ children, color = '#4E44CE', ...props }) => {
    const { publicKey, wallet, disconnect } = useWallet();
    const { setVisible } = useWalletModal();
    const [isCopied, setIsCopied] = React.useState(false);
    const [active, setActive] = useState(false);
    const dropdownRef = useRef(null);

    const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
    const content = useMemo(() => {
        if (children) return children;
        if (!wallet || !base58) return null;
        return base58.substr(0, 4) + '..' + base58.substr(-4, 4);
    }, [children, wallet, base58]);

    const copyAddress = async () => {
        if (typeof base58 === 'string') {
            await navigator.clipboard.writeText(base58);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 200);
        }
    };

    const openModal = () => {
        setVisible(true);
        closeDropdown();
    };

    const openDropdown = () => {
        setActive(true);
    };

    const closeDropdown = () => {
        setActive(false);
    };

    useOnClickOutside(dropdownRef, closeDropdown);

    if (!wallet) {
        return <WalletModalButton {...props} />;
    }

    if (!base58) {
        return <WalletConnectButton {...props} />;
    }

    return (
        <div className="wallet-adapter-dropdown">
            <Button
                buttonStyle={{ pointerEvents: active ? 'none' : 'auto', ...props.buttonStyle }}
                color={color}
                onClick={openDropdown}
                startIcon={<WalletIcon wallet={wallet} />}
                {...props}
            >
                {content}
            </Button>
            <ul
                className={`wallet-adapter-dropdown-list ${active && 'wallet-adapter-dropdown-list-active'}`}
                ref={dropdownRef}
            >
                <li onClick={copyAddress} className="wallet-adapter-multi-button-item">
                    {isCopied ? 'Copied' : 'Copy address'}
                </li>
                <li onClick={openModal} className="wallet-adapter-multi-button-item">
                    Connect a different wallet
                </li>
                <li onClick={disconnect} className="wallet-adapter-multi-button-item">
                    Disconnect
                </li>
            </ul>
        </div>
    );
};
