import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-wallets';
import { Menu, Modal, ModalProps } from 'antd';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { useWalletModal } from './useWalletModal';
import { WalletListItem } from './WalletListItem';

export interface WalletModalProps extends Omit<ModalProps, 'visible'> {
    featuredWalletsNumber?: number;
}

export const WalletModal: FC<WalletModalProps> = ({
    title = 'Select your wallet',
    featuredWalletsNumber = 2,
    onCancel,
    ...props
}) => {
    const { wallets, select } = useWallet();
    const { visible, setVisible } = useWalletModal();
    const [expanded, setExpanded] = useState(false);

    const [featuredWallets, otherWallets, expands] = useMemo(
        () => [
            wallets.slice(0, featuredWalletsNumber),
            wallets.slice(featuredWalletsNumber),
            wallets.length > featuredWalletsNumber,
        ],
        [wallets, featuredWalletsNumber]
    );

    const handleCancel = useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            if (onCancel) onCancel(event);
            if (!event.defaultPrevented) setVisible(false);
        },
        [onCancel, setVisible]
    );

    const handleWalletClick = useCallback(
        (event: React.MouseEvent<HTMLElement>, walletName: WalletName) => {
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
                {featuredWallets.map((wallet) => (
                    <WalletListItem
                        key={wallet.name}
                        handleClick={(event) => handleWalletClick(event, wallet.name)}
                        wallet={wallet}
                    />
                ))}
                {expands && (
                    <Menu.SubMenu key="wallet-adapter-modal-submenu" title={`${expanded ? 'Less' : 'More'} options`}>
                        {otherWallets.map((wallet) => (
                            <WalletListItem
                                key={wallet.name}
                                handleClick={(event) => handleWalletClick(event, wallet.name)}
                                wallet={wallet}
                            />
                        ))}
                    </Menu.SubMenu>
                )}
            </Menu>
        </Modal>
    );
};
