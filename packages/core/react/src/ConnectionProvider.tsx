import { Connection, ConnectionConfig, clusterApiUrl, Cluster } from '@solana/web3.js';
import React, { FC, ReactNode, useState } from 'react';
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
    const [connection, setConnection] = useState<Connection>(new Connection(endpoint, config));
    const [url, setUrl] = useState<string>(endpoint);
    const updateConnection = (network: string, isURL: boolean) => {
        if(isURL) {
            const newConnection = new Connection(network, config);
            setUrl(network);
            setConnection(newConnection);
        } else {
            const clusterUrl = clusterApiUrl(network as Cluster);
            const newConnection = new Connection(clusterUrl);
            setConnection(newConnection);
            setUrl(clusterUrl);
        }
    };

    return <ConnectionContext.Provider value={{ connection, updateConnection, endpoint: url }}>{children}</ConnectionContext.Provider>;
};
