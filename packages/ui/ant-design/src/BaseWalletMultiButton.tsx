import {
    CopyOutlined as CopyIcon,
    DisconnectOutlined as DisconnectIcon,
    SwapOutlined as SwitchIcon,
} from '@ant-design/icons';
import { useWalletMultiButton } from '@solana/wallet-adapter-base-ui';
import type { ButtonProps } from 'antd';
import { Dropdown, Menu } from 'antd';
import React, { useMemo } from 'react';
import { BaseWalletConnectionButton } from './BaseWalletConnectionButton.js';
import { useWalletModal } from './useWalletModal.js';

type Props = ButtonProps & {
    labels: Omit<
        { [TButtonState in ReturnType<typeof useWalletMultiButton>['buttonState']]: string },
        'connected' | 'disconnecting'
    > & {
        'copy-address': string;
        'change-wallet': string;
        disconnect: string;
    };
};

export function BaseWalletMultiButton({ children, labels, ...props }: Props) {
    const { setVisible: setModalVisible } = useWalletModal();
    const { buttonState, onConnect, onDisconnect, publicKey, walletIcon, walletName } = useWalletMultiButton({
        onSelectWallet() {
            setModalVisible(true);
        },
    });
    const content = useMemo(() => {
        if (children) {
            return children;
        } else if (publicKey) {
            const base58 = publicKey.toBase58();
            return base58.slice(0, 4) + '..' + base58.slice(-4);
        } else if (buttonState === 'connecting' || buttonState === 'has-wallet') {
            return labels[buttonState];
        } else {
            return labels['no-wallet'];
        }
    }, [buttonState, children, labels, publicKey]);
    return (
        <Dropdown
            overlay={
                <Menu className="wallet-adapter-multi-button-menu">
                    <Menu.Item className="wallet-adapter-multi-button-menu-item">
                        <BaseWalletConnectionButton
                            {...props}
                            block
                            className="wallet-adapter-multi-button-menu-button"
                            walletIcon={walletIcon}
                            walletName={walletName}
                        >
                            {walletName}
                        </BaseWalletConnectionButton>
                    </Menu.Item>
                    {publicKey ? (
                        <Menu.Item
                            className="wallet-adapter-multi-button-item"
                            icon={<CopyIcon className=".wallet-adapter-multi-button-icon" />}
                            onClick={async () => {
                                await navigator.clipboard.writeText(publicKey?.toBase58());
                            }}
                        >
                            {labels['copy-address']}
                        </Menu.Item>
                    ) : null}
                    <Menu.Item
                        onClick={() => setTimeout(() => setModalVisible(true), 100)}
                        icon={<SwitchIcon className=".wallet-adapter-multi-button-icon" />}
                        className="wallet-adapter-multi-button-item"
                    >
                        {labels['change-wallet']}
                    </Menu.Item>
                    {onDisconnect ? (
                        <Menu.Item
                            onClick={onDisconnect}
                            icon={<DisconnectIcon className=".wallet-adapter-multi-button-icon" />}
                            className="wallet-adapter-multi-button-item"
                        >
                            {labels['disconnect']}
                        </Menu.Item>
                    ) : null}
                </Menu>
            }
            trigger={buttonState === 'connected' ? ['click'] : []}
        >
            <BaseWalletConnectionButton
                {...props}
                onClick={() => {
                    switch (buttonState) {
                        case 'no-wallet':
                            setModalVisible(true);
                            break;
                        case 'has-wallet':
                            if (onConnect) {
                                onConnect();
                            }
                            break;
                    }
                }}
                walletIcon={walletIcon}
                walletName={walletName}
            >
                {content}
            </BaseWalletConnectionButton>
        </Dropdown>
    );
}
