import { useWallet } from '@solana/wallet-adapter-react';
import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import { Button, ButtonProps } from './Button';
import { useOnClickOutside } from './hooks';
import { useWalletModal } from './useWalletModal';
import { WalletConnectButton } from './WalletConnectButton';
import { WalletIcon } from './WalletIcon';
import { WalletModalButton } from './WalletModalButton';

export const WalletMultiButton: FC<ButtonProps> = ({ children, color = '#4E44CE', ...props }) => {
    const { publicKey, wallet, disconnect } = useWallet();
    const { setVisible } = useWalletModal();
    const [isCopied, setIsCopied] = useState(false);
    const [active, setActive] = useState(false);
    const dropdownRef = useRef<HTMLUListElement>(null);

    const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
    const content = useMemo(() => {
        if (children) return children;
        if (!wallet || !base58) return null;
        return base58.slice(0, 4) + '..' + base58.slice(-4);
    }, [children, wallet, base58]);

    const copyAddress = useCallback(async () => {
        if (base58) {
            await navigator.clipboard.writeText(base58);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 400);
        }
    }, [base58]);

    const openDropdown = useCallback(() => setActive(true), [setActive]);

    const closeDropdown = useCallback(() => setActive(false), [setActive]);

    const openModal = useCallback(() => {
        setVisible(true);
        closeDropdown();
    }, [setVisible, closeDropdown]);

    useOnClickOutside(dropdownRef, closeDropdown);

    if (!wallet) return <WalletModalButton {...props} />;
    if (!base58) return <WalletConnectButton {...props} />;

    return (
        <div className="wallet-adapter-dropdown">
            <Button
                aria-expanded={active}
                style={{ pointerEvents: active ? 'none' : 'auto', ...props.style }}
                color={color}
                onClick={openDropdown}
                startIcon={<WalletIcon wallet={wallet} />}
                {...props}
            >
                {content}
            </Button>
            <ul
                aria-label="dropdown-list"
                className={`wallet-adapter-dropdown-list ${active && 'wallet-adapter-dropdown-list-active'}`}
                ref={dropdownRef}
                role="menu"
            >
                <li onClick={copyAddress} className="wallet-adapter-dropdown-list-item" role="menuitem">
                    {isCopied ? 'Copied' : 'Copy address'}
                </li>
                <li onClick={openModal} className="wallet-adapter-dropdown-list-item" role="menuitem">
                    Connect a different wallet
                </li>
                <li onClick={disconnect} className="wallet-adapter-dropdown-list-item" role="menuitem">
                    Disconnect
                </li>
            </ul>
        </div>
    );
};
