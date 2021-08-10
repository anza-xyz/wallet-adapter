import { useWallet } from '@solana/wallet-adapter-react';
import { Button, Menu, Modal, ModalProps } from 'antd';
import React, { FC, ReactElement } from 'react';
import { useWalletModal } from './useWalletModal';
import { WalletIcon } from './WalletIcon';

export interface WalletModalProps extends Omit<ModalProps, 'visible'> {}

export const WalletModal: FC<WalletModalProps> = ({ title = 'Select your wallet', ...props }) => {
    const { wallets, select } = useWallet();
    const { visible, setVisible } = useWalletModal();

    return (
        <Modal title={title} visible={visible} {...props}>
            <Menu>
                {wallets.map((wallet) => (
                    <Menu.Item key={wallet.name}>
                        <Button
                            onClick={(event) => {
                                select(wallet.name);
                                setVisible(false);
                            }}
                            icon={<WalletIcon wallet={wallet} />}
                        >
                            {wallet.name}
                        </Button>
                    </Menu.Item>
                ))}
            </Menu>
        </Modal>
    );
};
