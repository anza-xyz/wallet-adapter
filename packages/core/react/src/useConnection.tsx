import { Connection } from '@solana/web3.js';
import React, { createContext, useContext } from 'react';

export interface ConnectionContextState {
    connection: Connection;
}

export const ConnectionContext = createContext<ConnectionContextState>({} as ConnectionContextState);
export const ConnectionDispatchContext = createContext<React.Dispatch<Connection>>({} as React.Dispatch<Connection>);

export function useConnection(): ConnectionContextState {
    return useContext(ConnectionContext);
}

export function useSetConnection(): (connection: Connection) => void {
    const dispatch = useContext(ConnectionDispatchContext);
    return (connection: Connection) => dispatch(connection);
}
