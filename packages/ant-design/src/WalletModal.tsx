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
            <Menu
                style={{
                    borderRight: 0,
                }}
            >
                {wallets.map((wallet) => (
                    <Menu.Item
                        key={wallet.name}
                        style={{
                            margin: 0,
                            padding: 0,
                            paddingLeft: 0,
                            paddingRight: 0,
                            height: 44,
                            lineHeight: '44px',
                            boxShadow: 'inset 0 -1px 0 0 ' + 'rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        <Button
                            onClick={(event) => {
                                select(wallet.name);
                                setVisible(false);
                            }}
                            icon={<WalletIcon wallet={wallet} style={{ width: 24, height: 24, marginLeft: 8 }} />}
                            type="text"
                            style={{
                                height: 44,
                                paddingLeft: 24,
                                display: 'flex',
                                flexDirection: 'row-reverse',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
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
