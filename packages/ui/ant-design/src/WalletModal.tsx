import type { WalletName } from '@solana/wallet-adapter-base';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { useWallet, type Wallet } from '@solana/wallet-adapter-react';
import type { ModalProps } from 'antd';
import { Menu, Modal } from 'antd';
import type { FC, MouseEvent } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import { useWalletModal } from './useWalletModal.js';
import { WalletMenuItem } from './WalletMenuItem.js';

export interface WalletModalProps extends Omit<ModalProps, 'visible'> {
    featuredWallets?: number;
}

export const WalletModal: FC<WalletModalProps> = ({
    title = 'Select your wallet',
    featuredWallets = 3,
    onCancel,
    ...props
}) => {
    const { wallets, select } = useWallet();
    const { visible, setVisible } = useWalletModal();
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

    const handleCancel = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            if (onCancel) onCancel(event);
            if (!event.defaultPrevented) setVisible(false);
        },
        [onCancel, setVisible]
    );

    const handleWalletClick = useCallback(
        (event: MouseEvent<HTMLElement>, walletName: WalletName) => {
            select(walletName);
            handleCancel(event);
        },
        [select, handleCancel]
    );

    const onOpenChange = useCallback(() => setExpanded(!expanded), [setExpanded, expanded]);

    return (
        <Modal
            title={title}
            visible={visible}
            centered={true}
            onCancel={handleCancel}
            footer={null}
            width={320}
            bodyStyle={{ padding: 0 }}
            {...props}
        >
            <Menu className="wallet-adapter-modal-menu" inlineIndent={0} mode="inline" onOpenChange={onOpenChange}>
                {featured.map((wallet) => (
                    <WalletMenuItem
                        key={wallet.adapter.name}
                        onClick={(event) => handleWalletClick(event, wallet.adapter.name)}
                        wallet={wallet}
                    />
                ))}
                {more.length ? (
                    <Menu.SubMenu key="wallet-adapter-modal-submenu" title={`${expanded ? 'Less' : 'More'} options`}>
                        {more.map((wallet) => (
                            <WalletMenuItem
                                key={wallet.adapter.name}
                                onClick={(event) => handleWalletClick(event, wallet.adapter.name)}
                                wallet={wallet}
                            />
                        ))}
                    </Menu.SubMenu>
                ) : null}
            </Menu>
        </Modal>
    );
};
