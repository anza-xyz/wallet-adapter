import React, { FC, useState } from 'react';
import { ConnectionModalContext } from './useConnectionModal';
import { ConnectionModal, ConnectionModalProps } from './ConnectionModal';

export const ConnectionModalProvider: FC<ConnectionModalProps> = ({ children, ...props }) => {
    const [visible, setVisible] = useState(false);

    return (
        <ConnectionModalContext.Provider value={{ visible, setVisible }}>
            {children}
            <ConnectionModal {...props} />
        </ConnectionModalContext.Provider>
    );
};
