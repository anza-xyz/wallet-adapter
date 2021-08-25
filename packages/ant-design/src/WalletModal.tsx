import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-wallets';
import { Menu, Modal, ModalProps } from 'antd';
import React, { FC, useCallback, useState } from 'react';
import { useWalletModal } from './useWalletModal';
import { WalletListItem } from './WalletListItem';

export interface WalletModalProps extends Omit<ModalProps, 'visible'> {
    featuredWalletsNumber?: number;
}

export const WalletModal: FC<WalletModalProps> = ({
    title = 'Select your wallet',
    featuredWalletsNumber = 2,
    ...props
}) => {
    const { wallets, select } = useWallet();
    const { visible, setVisible } = useWalletModal();
    const [expanded, setExpanded] = useState(false);

    const featuredWallets = wallets.slice(0, featuredWalletsNumber);
    const otherWallets = wallets.slice(featuredWalletsNumber);

    const handleWalletClick = (walletName: WalletName) => {
        select(walletName);
        setVisible(false);
    };

    const onCancel = useCallback(() => setVisible(false), [setVisible]);

    const handleChange = () => {
        setExpanded(!expanded);
    };

    return (
        <Modal
            title={title}
            visible={visible}
            centered={true}
            onCancel={onCancel}
            footer={null}
            width={320}
            bodyStyle={{ padding: 0 }}
            {...props}
        >
            <Menu className="wallet-adapter-modal-menu" inlineIndent={0} mode="inline" onOpenChange={handleChange}>
                {featuredWallets.map((wallet) => (
                    <WalletListItem
                        key={wallet.name}
                        handleClick={() => handleWalletClick(wallet.name)}
                        wallet={wallet}
                    />
                ))}
                <Menu.SubMenu key="wallet-adapter-modal-submenu" title={`${expanded ? 'Less' : 'More'} options`}>
                    {otherWallets.map((wallet) => (
                        <WalletListItem
                            key={wallet.name}
                            handleClick={() => handleWalletClick(wallet.name)}
                            wallet={wallet}
                        />
                    ))}
                </Menu.SubMenu>
            </Menu>
        </Modal>
    );
};
