import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base';
import { useWallet, Wallet } from '@solana/wallet-adapter-react';
import React, { FC, MouseEvent, ReactNode, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { WalletUIAlt } from './WalletUIAlt';
import { Button } from './Button';
import { Collapse } from './Collapse';
import { useWalletModal } from './useWalletModal';
import { WalletListItem } from './WalletListItem';
import { WalletUIMain } from './WalletUIMain';

export interface WalletModalProps {
    className?: string;
    featuredWallets?: number;
    container?: string;
}

export const WalletModal: FC<WalletModalProps> = ({ className = '', featuredWallets = 3, container = 'body' }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { wallets, select } = useWallet();
    const { setVisible } = useWalletModal();
    const [expanded, setExpanded] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);
    const [portal, setPortal] = useState<Element | null>(null);

    const [featured, more] = useMemo(() => {
        const installedWallets: Wallet[] = [];
        const undetectedWallets: Wallet[] = [];
        const loadableWallets: Wallet[] = [];
        wallets.forEach((wallet: Wallet) => {
            if (wallet.readyState === WalletReadyState.Installed) {
                installedWallets.push(wallet);
            } else if(wallet.readyState === WalletReadyState.NotDetected) {
                undetectedWallets.push(wallet);
            } else if (wallet.readyState === WalletReadyState.Loadable) {
                loadableWallets.push(wallet);
            }
        });
        const installableWallets = installedWallets.concat(undetectedWallets);
        const remainingFeaturedSpots = Math.max(0, featuredWallets - (installableWallets.length && 1) - (loadableWallets.length && 1)); 
        const otherWallets = installableWallets.slice(1).concat(loadableWallets.slice(1));
        return [
            [...installableWallets.slice(0,1), ...loadableWallets.slice(0,1), ...otherWallets.slice(0, remainingFeaturedSpots)],
            otherWallets.slice(remainingFeaturedSpots)
        ];
    }, [wallets, featuredWallets]);

    const getStartedWallet = useMemo(() => {
        const torusWallet = wallets.find((wallet: { adapter: { name: WalletName; }; })=> wallet.adapter.name === 'Torus')
        if (torusWallet) return torusWallet.adapter.name;

        const loadable = wallets.filter((wallet: { readyState: any; }) => wallet.readyState === WalletReadyState.Loadable);
        return loadable[0]?.adapter.name || featured[0]?.adapter.name
    }, [wallets, featured]);

    const installedWalletDetected = useMemo(() => {
        if(wallets.some(wallet => wallet.readyState === WalletReadyState.Installed)) return true;
        return false;
    }, [wallets]);

    const hideModal = useCallback(() => {
        setFadeIn(false);
        setTimeout(() => setVisible(false), 150);
    }, []);

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

    const handleCollapseClick = useCallback(() => {
        setExpanded(!expanded);
    }, [expanded]);

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

    const uiProps = useMemo(()=>({
        className,
        fadeIn,
        wallets,
        featured,
        getStartedWallet,
        more,
        expanded,
        handleClose,
        handleWalletClick,
        handleCollapseClick,
    }), [className, fadeIn, wallets, featured, getStartedWallet, more, expanded, handleClose, handleWalletClick, handleCollapseClick]);

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

    useLayoutEffect(() => {
        setPortal(document.querySelector(container));
    }, [container]);

    return (
        portal &&
        createPortal(
            installedWalletDetected ? <WalletUIMain {...uiProps}  /> : <WalletUIAlt {...uiProps} />,
            portal
        )
    );
};
