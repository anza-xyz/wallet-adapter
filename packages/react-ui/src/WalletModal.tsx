import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-wallets';
import React, { FC, useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useWalletModal } from './useWalletModal';
import { Button } from './Button';
import { Collapse } from './Collapse';
import { WalletListItem } from './WalletListItem';

export interface WalletModalProps {
    className?: string;
    featuredWalletsNumber?: number;
    logo?: string;
    root?: string;
}

export const WalletModal: FC<WalletModalProps> = ({
    className = '',
    featuredWalletsNumber = 2,
    logo,
    root = 'body',
}) => {
    const modalRef = useRef() as React.MutableRefObject<HTMLDivElement>;
    const { wallets, select } = useWallet();
    const { setVisible } = useWalletModal();
    const [expanded, setExpanded] = React.useState(false);
    const [fadeIn, setFadeIn] = React.useState(false);

    const rootElement = useMemo(() => document.querySelector(root), [root]);

    const [featuredWallets, otherWallets, expands] = useMemo(
        () => [
            wallets.slice(0, featuredWalletsNumber),
            wallets.slice(featuredWalletsNumber),
            wallets.length > featuredWalletsNumber,
        ],
        [wallets, featuredWalletsNumber]
    );

    const hideModal = useCallback(() => {
        setFadeIn(false);
        setTimeout(() => setVisible(false), 150);
    }, [setFadeIn, setVisible]);

    const handleClose = (e: React.MouseEvent) => {
        e.preventDefault();
        hideModal();
    };

    const handleCollapseClick = () => {
        setExpanded(!expanded);
    };

    const handleWalletClick = (event: React.MouseEvent, walletName: WalletName) => {
        select(walletName);
        handleClose(event);
    };

    useLayoutEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                hideModal();
            } else if (e.key === 'Tab') {
                handleTabKey(e, modalRef);
            }
        };

        const originalStyle = window.getComputedStyle(document.body).overflow;
        // Hack to enable fade in animation after mount
        setTimeout(() => setFadeIn(true), 0);
        // Prevent scrolling on mount
        document.body.style.overflow = 'hidden';
        // Listen for keydown events
        window.addEventListener('keydown', handleKeyDown, false);

        return () => {
            // Re-enable scrolling when component unmounts
            document.body.style.overflow = originalStyle;
            window.removeEventListener('keydown', handleKeyDown, false);
        };
    }, [handleTabKey, hideModal]);

    if (!rootElement) return null;

    return createPortal(
        <div
            aria-labelledby="wallet-adapter-modal-title"
            aria-modal="true"
            className={`wallet-adapter-modal ${fadeIn && 'wallet-adapter-modal-fade-in'} ${className}`}
            ref={modalRef}
            role="dialog"
        >
            <div className={`wallet-adapter-modal-wrapper ${!logo && 'wallet-adapter-modal-wrapper-no-logo'}`}>
                {logo && (
                    <div className="wallet-adapter-modal-logo-wrapper">
                        <img alt="logo" className="wallet-adapter-modal-logo" src={logo} />
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
                    {featuredWallets.map((wallet) => (
                        <WalletListItem
                            key={wallet.name}
                            handleClick={(event) => handleWalletClick(event, wallet.name)}
                            wallet={wallet}
                        />
                    ))}
                </ul>
                {expands && (
                    <>
                        <Collapse expanded={expanded} id="wallet-adapter-modal-collapse">
                            <ul className="wallet-adapter-modal-list">
                                {otherWallets.map((wallet) => (
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
        rootElement
    );
};

const handleTabKey = (e: KeyboardEvent, modalRef: React.MutableRefObject<HTMLDivElement>) => {
    // here we query all focusable elements
    const focusableElements = modalRef.current.querySelectorAll('button');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // if going forward by pressing tab and lastElement is active shift focus to first focusable element
    if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        return e.preventDefault();
    }

    // if going backward by pressing tab and firstElement is active shift focus to last focusable element
    if (e.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
    }
};
