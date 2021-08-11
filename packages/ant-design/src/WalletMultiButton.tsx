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
    children,
    disabled,
    onClick,
    ...props
}) => {
    const { publicKey, wallet, disconnect } = useWallet();
    const { setVisible } = useWalletModal();

    const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
    const content = useMemo(() => {
        if (children) return children;
        if (!wallet || !base58) return null;
        return base58.substr(0, 4) + '..' + base58.substr(-4, 4);
    }, [children, wallet, base58]);

    if (!wallet) {
        return <WalletModalButton {...props} />;
    }

    if (!base58) {
        return <WalletConnectButton {...props} />;
    }

    return (
        <Dropdown
            overlay={
                <Menu style={{ padding: 0, marginTop: -44 }}>
                    <Menu.Item style={{ padding: 0 }}>
                        <Button
                            icon={<WalletIcon wallet={wallet} />}
                            type={type}
                            size={size}
                            style={{ textAlign: 'left' }}
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
                        icon={<CopyIcon style={{ fontSize: 20, marginRight: 12 }} />}
                        style={{ padding: 0, paddingLeft: 12, paddingRight: 16, paddingTop: 8, paddingBottom: 8 }}
                    >
                        Copy address
                    </Menu.Item>
                    <Menu.Item
                        onClick={() => setTimeout(() => setVisible(true), 100)}
                        icon={<SwitchIcon style={{ fontSize: 20, marginRight: 12 }} />}
                        style={{ padding: 0, paddingLeft: 12, paddingRight: 16, paddingTop: 8, paddingBottom: 8 }}
                    >
                        Connect a different wallet
                    </Menu.Item>
                    <Menu.Item
                        onClick={() => {
                            // eslint-disable-next-line @typescript-eslint/no-empty-function
                            disconnect().catch(() => {});
                        }}
                        icon={<DisconnectIcon style={{ fontSize: 20, marginRight: 12 }} />}
                        style={{ padding: 0, paddingLeft: 12, paddingRight: 16, paddingTop: 8, paddingBottom: 8 }}
                    >
                        Disconnect
                    </Menu.Item>
                </Menu>
            }
            trigger={['click']}
        >
            <Button icon={<WalletIcon wallet={wallet} />} type={type} size={size} {...props}>
                {content}
            </Button>
        </Dropdown>
    );
};
