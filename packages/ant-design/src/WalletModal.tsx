import { useWallet } from '@solana/wallet-adapter-react';
import { Button, Menu, Modal, ModalProps } from 'antd';
import React, { FC, useCallback } from 'react';
import { useWalletModal } from './useWalletModal';
import { WalletIcon } from './WalletIcon';

export interface WalletModalProps extends Omit<ModalProps, 'visible'> {}

export const WalletModal: FC<WalletModalProps> = ({ title = 'Select your wallet', ...props }) => {
    const { wallets, select } = useWallet();
    const { visible, setVisible } = useWalletModal();

    const onCancel = useCallback(() => setVisible(false), [setVisible]);

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
            <Menu className="wallet-adapter-modal-menu">
                {wallets.map((wallet) => (
                    <Menu.Item key={wallet.name} className="wallet-adapter-modal-menu-item">
                        <Button
                            onClick={() => {
                                select(wallet.name);
                                setVisible(false);
                            }}
                            icon={<WalletIcon wallet={wallet} className="wallet-adapter-modal-menu-button-icon" />}
                            type="text"
                            className="wallet-adapter-modal-menu-button"
                            block
                        >
                            {wallet.name}
                        </Button>
                    </Menu.Item>
                ))}
            </Menu>
        </Modal>
    );
};
