import { Connection } from '@solana/web3.js';
import React, { createContext, useContext } from 'react';

export interface ConnectionContextState {
    connection: Connection;
}

export const ConnectionContext = createContext<ConnectionContextState>({} as ConnectionContextState);

export function useConnection(): ConnectionContextState {
    return useContext(ConnectionContext);
}
