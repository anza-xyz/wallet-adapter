import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-wallets';
import React, { FC, MouseEvent, ReactNode, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { Collapse } from './Collapse';
import { useWalletModal } from './useWalletModal';
import { WalletListItem } from './WalletListItem';

export interface WalletModalProps {
    className?: string;
    logo?: ReactNode;
    featuredWallets?: number;
    container?: string;
}

export const WalletModal: FC<WalletModalProps> = ({
    className = '',
    logo,
    featuredWallets = 2,
    container = 'body',
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const { wallets, select } = useWallet();
    const { setVisible } = useWalletModal();
    const [expanded, setExpanded] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);
    const [portal, setPortal] = useState<Element | null>(null);

    const [featured, more] = useMemo(
        () => [wallets.slice(0, featuredWallets), wallets.slice(featuredWallets)],
        [wallets, featuredWallets]
    );

    const hideModal = useCallback(() => {
        setFadeIn(false);
        setTimeout(() => setVisible(false), 150);
    }, [setFadeIn, setVisible]);

    const handleClose = useCallback(
        (event: MouseEvent) => {
            event.preventDefault();
            hideModal();
        },
        [hideModal]
    );

    const handleWalletClick = useCallback(
        (event: MouseEvent, walletName: WalletName) => {
            select(walletName);
            handleClose(event);
        },
        [select, handleClose]
    );

    const handleCollapseClick = useCallback(() => setExpanded(!expanded), [setExpanded, expanded]);

    const handleTabKey = useCallback(
        (event: KeyboardEvent) => {
            const node = ref.current;
            if (!node) return;

            // here we query all focusable elements
            const focusableElements = node.querySelectorAll('button');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey) {
                // if going backward by pressing tab and firstElement is active, shift focus to last focusable element
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else {
                // if going forward by pressing tab and lastElement is active, shift focus to first focusable element
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        },
        [ref]
    );

    useLayoutEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                hideModal();
            } else if (event.key === 'Tab') {
                handleTabKey(event);
            }
        };

        // Get original overflow
        const { overflow } = window.getComputedStyle(document.body);
        // Hack to enable fade in animation after mount
        setTimeout(() => setFadeIn(true), 0);
        // Prevent scrolling on mount
        document.body.style.overflow = 'hidden';
        // Listen for keydown events
        window.addEventListener('keydown', handleKeyDown, false);

        return () => {
            // Re-enable scrolling when component unmounts
            document.body.style.overflow = overflow;
            window.removeEventListener('keydown', handleKeyDown, false);
        };
    }, [hideModal, handleTabKey]);

    useLayoutEffect(() => setPortal(document.querySelector(container)), [setPortal, container]);

    return (
        portal &&
        createPortal(
            <div
                aria-labelledby="wallet-adapter-modal-title"
                aria-modal="true"
                className={`wallet-adapter-modal ${fadeIn && 'wallet-adapter-modal-fade-in'} ${className}`}
                ref={ref}
                role="dialog"
            >
                <div className={`wallet-adapter-modal-wrapper ${!logo && 'wallet-adapter-modal-wrapper-no-logo'}`}>
                    {logo && (
                        <div className="wallet-adapter-modal-logo-wrapper">
                            {typeof logo === 'string' ? (
                                <img alt="logo" className="wallet-adapter-modal-logo" src={logo} />
                            ) : (
                                logo
                            )}
                        </div>
                    )}
                    <h1 className="wallet-adapter-modal-title" id="wallet-adapter-modal-title">
                        Connect Wallet
                    </h1>
                    <button onClick={handleClose} className="wallet-adapter-modal-button-close">
                        <svg width="14" height="14">
                            <path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z" />
                        </svg>
                    </button>
                    <ul className="wallet-adapter-modal-list">
                        {featured.map((wallet) => (
                            <WalletListItem
                                key={wallet.name}
                                handleClick={(event) => handleWalletClick(event, wallet.name)}
                                wallet={wallet}
                            />
                        ))}
                    </ul>
                    {more.length && (
                        <>
                            <Collapse expanded={expanded} id="wallet-adapter-modal-collapse">
                                <ul className="wallet-adapter-modal-list">
                                    {more.map((wallet) => (
                                        <WalletListItem
                                            key={wallet.name}
                                            handleClick={(event) => handleWalletClick(event, wallet.name)}
                                            tabIndex={expanded ? 0 : -1}
                                            wallet={wallet}
                                        />
                                    ))}
                                </ul>
                            </Collapse>
                            <Button
                                aria-controls="wallet-adapter-modal-collapse"
                                aria-expanded={expanded}
                                className={`wallet-adapter-modal-collapse-button ${
                                    expanded && 'wallet-adapter-modal-collapse-button-active'
                                }`}
                                endIcon={
                                    <svg width="11" height="6" xmlns="http://www.w3.org/2000/svg">
                                        <path d="m5.938 5.73 4.28-4.126a.915.915 0 0 0 0-1.322 1 1 0 0 0-1.371 0L5.253 3.736 1.659.272a1 1 0 0 0-1.371 0A.93.93 0 0 0 0 .932c0 .246.1.48.288.662l4.28 4.125a.99.99 0 0 0 1.37.01z" />
                                    </svg>
                                }
                                onClick={handleCollapseClick}
                            >
                                {expanded ? 'Less' : 'More'} options
                            </Button>
                        </>
                    )}
                </div>
                <div className="wallet-adapter-modal-overlay" onMouseDown={handleClose} />
            </div>,
            portal
        )
    );
};
