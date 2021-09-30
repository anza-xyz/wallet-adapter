import { Button, Menu, MenuItemProps } from 'antd';
import React, { FC, MouseEventHandler } from 'react';

interface ConnectionMenuItemProps extends Omit<MenuItemProps, 'onClick'> {
    onClick: MouseEventHandler<HTMLButtonElement>;
    connection: {
        name: string;
    };
}

export const ConnectionMenuItem: FC<ConnectionMenuItemProps> = ({ onClick, connection, ...props }) => {
    return (
        <Menu.Item className="wallet-adapter-modal-menu-item" {...props}>
            <Button onClick={onClick} type="text" className="wallet-adapter-connection-modal-menu-button" block>
                {connection.name}
            </Button>
        </Menu.Item>
    );
};
