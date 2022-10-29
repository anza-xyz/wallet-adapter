import { Connection, type ConnectionConfig } from '@solana/web3.js';
import React, { useMemo, type FC, type ReactNode } from 'react';
import { ConnectionContext } from './useConnection.js';

export interface ConnectionProviderProps {
    children: ReactNode;
    endpoint: string;
    config?: ConnectionConfig;
}

export const ConnectionProvider: FC<ConnectionProviderProps> = ({
    children,
    endpoint,
    config = { commitment: 'confirmed' },
}) => {
    const connection = useMemo(() => new Connection(endpoint, config), [endpoint, config]);

    return <ConnectionContext.Provider value={{ connection }}>{children}</ConnectionContext.Provider>;
};
