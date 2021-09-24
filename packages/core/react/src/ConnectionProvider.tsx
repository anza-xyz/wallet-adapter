import { Connection, ConnectionConfig } from '@solana/web3.js';
import React, { FC, ReactNode, useMemo } from 'react';
import { ConnectionContext } from './useConnection';

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
