import { WalletName } from '@solana/wallet-adapter-base';
import { Wallet } from '@solana/wallet-adapter-react';
import React, { MouseEvent } from 'react';
import { Collapse } from './Collapse';
import { WalletListItem } from './WalletListItem';

export interface WalletUIMain {
    className?: string;
    fadeIn: boolean;
    featured: Wallet[];
    getStartedWallet: WalletName;
    more: Wallet[];
    expanded: boolean;
    handleClose: (arg0: MouseEvent) => void;
    handleWalletClick: (arg0: MouseEvent, arg1: WalletName) => void;
    handleCollapseClick: () => void;
}

export const WalletUIMain = React.forwardRef<HTMLDivElement, WalletUIMain>(
    (
        {
            className = '',
            fadeIn,
            featured,
            getStartedWallet,
            more,
            expanded,
            handleClose,
            handleWalletClick,
            handleCollapseClick,
        },
        ref
    ) => {
        return (
            <div
                aria-labelledby="wallet-adapter-modal-title"
                aria-modal="true"
                className={`wallet-adapter-modal ${fadeIn && 'wallet-adapter-modal-fade-in'} ${className}`}
                ref={ref}
                role="dialog"
            >
                <div className="wallet-adapter-modal-container">
                    <div className="wallet-adapter-modal-wrapper">
                        <button onClick={handleClose} className="wallet-adapter-modal-button-close">
                            <svg width="14" height="14">
                                <path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z" />
                            </svg>
                        </button>
                        <h1 className="wallet-adapter-modal-title">Connect a wallet on Solana to continue</h1>
                        <ul className="wallet-adapter-modal-list">
                            {featured.map((wallet) => (
                                <WalletListItem
                                    key={wallet.adapter.name}
                                    handleClick={(event) => handleWalletClick(event, wallet.adapter.name)}
                                    wallet={wallet}
                                />
                            ))}
                            {!!more.length && (
                                <Collapse expanded={expanded} id="wallet-adapter-modal-collapse">
                                    {more.map((wallet) => (
                                        <WalletListItem
                                            key={wallet.adapter.name}
                                            handleClick={(event) => handleWalletClick(event, wallet.adapter.name)}
                                            tabIndex={expanded ? 0 : -1}
                                            wallet={wallet}
                                        />
                                    ))}
                                </Collapse>
                            )}
                        </ul>
                        {!!more.length && (
                            <button
                                className="wallet-adapter-modal-list-more"
                                onClick={handleCollapseClick}
                                tabIndex={0}
                            >
                                <span>{expanded ? 'Less ' : 'More '}options</span>
                                <svg
                                    width="13"
                                    height="7"
                                    viewBox="0 0 13 7"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`${expanded ? 'wallet-adapter-modal-list-more-icon-rotate' : ''}`}
                                >
                                    <path
                                        d="M0.71418 1.626L5.83323 6.26188C5.91574 6.33657 6.0181 6.39652 6.13327 6.43762C6.24844 6.47872 6.37371 6.5 6.50048 6.5C6.62725 6.5 6.75252 6.47872 6.8677 6.43762C6.98287 6.39652 7.08523 6.33657 7.16774 6.26188L12.2868 1.626C12.7753 1.1835 12.3703 0.5 11.6195 0.5H1.37997C0.629216 0.5 0.224175 1.1835 0.71418 1.626Z"
                                        fill="wallet-adapter-modal-fill-pale-violet"
                                    />
                                </svg>
                            </button>
                        )}
                        <div className="wallet-adapter-modal-bottom">
                            <h1 className="wallet-adapter-modal-bottom-title">Need a wallet on Solana?</h1>
                            <p className="wallet-adapter-modal-bottom-info">
                                To begin, you'll need to create wallet and add some funds.
                            </p>
                            <button
                                type="button"
                                className="wallet-adapter-modal-bottom-button"
                                onClick={(event) => handleWalletClick(event, getStartedWallet)}
                            >
                                Get started
                            </button>
                        </div>
                    </div>
                </div>
                <div className="wallet-adapter-modal-overlay" onMouseDown={handleClose} />
            </div>
        );
    }
);
