import {
    CopyOutlined as CopyIcon,
    DisconnectOutlined as DisconnectIcon,
    SwapOutlined as SwitchIcon,
} from '@ant-design/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button, ButtonProps, Dropdown, Menu } from 'antd';
import React, { FC, useMemo } from 'react';
import { useWalletModal } from './useWalletModal';
import { WalletConnectButton } from './WalletConnectButton';
import { WalletIcon } from './WalletIcon';
import { WalletModalButton } from './WalletModalButton';

export const WalletMultiButton: FC<ButtonProps> = ({
    type = 'primary',
    size = 'large',
    htmlType = 'button',
    children,
    ...props
}) => {
    const { publicKey, wallet, disconnect } = useWallet();
    const { setVisible } = useWalletModal();

    const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
    const content = useMemo(() => {
        if (children) return children;
        if (!wallet || !base58) return null;
        return base58.slice(0, 4) + '..' + base58.slice(-4);
    }, [children, wallet, base58]);

    if (!wallet) {
        return (
            <WalletModalButton type={type} size={size} htmlType={htmlType} {...props}>
                {children}
            </WalletModalButton>
        );
    }
    if (!base58) {
        return (
            <WalletConnectButton type={type} size={size} htmlType={htmlType} {...props}>
                {children}
            </WalletConnectButton>
        );
    }

    return (
        <Dropdown
            overlay={
                <Menu className="wallet-adapter-multi-button-menu">
                    <Menu.Item className="wallet-adapter-multi-button-menu-item">
                        <Button
                            icon={<WalletIcon wallet={wallet} />}
                            type={type}
                            size={size}
                            htmlType={htmlType}
                            className="wallet-adapter-multi-button-menu-button"
                            block
                            {...props}
                        >
                            {wallet.name}
                        </Button>
                    </Menu.Item>
                    <Menu.Item
                        onClick={async () => {
                            await navigator.clipboard.writeText(base58);
                        }}
                        icon={<CopyIcon className=".wallet-adapter-multi-button-icon" />}
                        className="wallet-adapter-multi-button-item"
                    >
                        Copy address
                    </Menu.Item>
                    <Menu.Item
                        onClick={() => setTimeout(() => setVisible(true), 100)}
                        icon={<SwitchIcon className=".wallet-adapter-multi-button-icon" />}
                        className="wallet-adapter-multi-button-item"
                    >
                        Connect a different wallet
                    </Menu.Item>
                    <Menu.Item
                        onClick={() => {
                            // eslint-disable-next-line @typescript-eslint/no-empty-function
                            disconnect().catch(() => {
                                // Silently catch because any errors are caught by the context `onError` handler
                            });
                        }}
                        icon={<DisconnectIcon className=".wallet-adapter-multi-button-icon" />}
                        className="wallet-adapter-multi-button-item"
                    >
                        Disconnect
                    </Menu.Item>
                </Menu>
            }
            trigger={['click']}
        >
            <Button icon={<WalletIcon wallet={wallet} />} type={type} size={size} htmlType={htmlType} {...props}>
                {content}
            </Button>
        </Dropdown>
    );
};
