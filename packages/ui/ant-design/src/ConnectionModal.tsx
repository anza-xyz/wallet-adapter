import { useSetConnection } from '@solana/wallet-adapter-react';
import { Menu, Modal, ModalProps } from 'antd';
import React, { FC, MouseEvent, useCallback, useMemo, useState } from 'react';
import { useConnectionModal } from './useConnectionModal';
import { ConnectionMenuItem } from './ConnectionMenuItem';
import { Connection } from '@solana/web3.js';

export interface ConnectionModalProps extends Omit<ModalProps, 'visible'> {
    connections: {
        name: string;
        endpoint: string;
    }[];
}

export const ConnectionModal: FC<ConnectionModalProps> = ({ title = 'Select connection', onCancel, ...props }) => {
    const { visible, setVisible } = useConnectionModal();
    const setConnection = useSetConnection();
    const [expanded, setExpanded] = useState(false);

    const handleCancel = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            if (onCancel) onCancel(event);
            if (!event.defaultPrevented) setVisible(false);
        },
        [onCancel, setVisible]
    );

    const handleConnectionClick = useCallback(
        (
            event: MouseEvent<HTMLElement>,
            connection: {
                name: string;
                endpoint: string;
            }
        ) => {
            // TODO: Add a way to replace commitment.
            setConnection(new Connection(connection.endpoint, { commitment: 'confirmed' }));
            handleCancel(event);
        },
        [handleCancel]
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
                {props.connections.map((connection) => (
                    <ConnectionMenuItem
                        key={connection.name}
                        onClick={(event) => handleConnectionClick(event, connection)}
                        connection={connection}
                    />
                ))}
            </Menu>
        </Modal>
    );
};
