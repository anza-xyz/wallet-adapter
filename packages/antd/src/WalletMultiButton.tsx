import { CopyOutlined as CopyIcon, DisconnectOutlined as DisconnectIcon } from '@ant-design/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button, ButtonProps, Dropdown, Menu } from 'antd';
import React, { FC, useMemo } from 'react';
import { useWalletModal } from './useWalletModal';
import { WalletConnectButton } from './WalletConnectButton';
import { WalletIcon } from './WalletIcon';
import { WalletModalButton } from './WalletModalButton';

export const WalletMultiButton: FC<ButtonProps> = ({ children, disabled, onClick, ...props }) => {
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
                <Menu>
                    <Menu.Item key={0}>
                        <Button icon={<WalletIcon wallet={wallet} />} {...props}>
                            {wallet.name}
                        </Button>
                    </Menu.Item>
                    <Menu.Item
                        key={1}
                        onClick={async () => {
                            await navigator.clipboard.writeText(base58);
                        }}
                        icon={<CopyIcon />}
                    >
                        Copy address
                    </Menu.Item>
                    <Menu.Item key={2} onClick={() => setVisible(true)} icon={<CopyIcon />}>
                        Connect a different wallet
                    </Menu.Item>
                    <Menu.Item
                        key={3}
                        onClick={() => {
                            // eslint-disable-next-line @typescript-eslint/no-empty-function
                            disconnect().catch(() => {});
                        }}
                        icon={<DisconnectIcon />}
                    >
                        Disconnect
                    </Menu.Item>
                </Menu>
            }
            trigger={['click']}
        >
            <Button icon={<WalletIcon wallet={wallet} />} {...props}>
                {content}
            </Button>
        </Dropdown>
    );
};
