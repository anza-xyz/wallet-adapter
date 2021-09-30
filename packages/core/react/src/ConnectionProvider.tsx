import { Connection, ConnectionConfig } from '@solana/web3.js';
import React, { FC, ReactNode, useEffect, useMemo, useReducer } from 'react';
import { ConnectionContext, ConnectionDispatchContext } from './useConnection';

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
    const [connection, setConnection] = useReducer(
        (_: Connection, newConnection: Connection) => newConnection,
        new Connection(endpoint, config)
    );
    useEffect(() => {
        setConnection(new Connection(endpoint, config));
    }, [endpoint, config]);
    return (
        <ConnectionDispatchContext.Provider value={setConnection}>
            <ConnectionContext.Provider value={{ connection }}>{children}</ConnectionContext.Provider>
        </ConnectionDispatchContext.Provider>
    );
};
