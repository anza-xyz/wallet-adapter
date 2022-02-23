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

    const updateConnection = (cluster?: Cluster, newEndpoint?: string) => {
        if(!cluster && newEndpoint) {
            const newConnection = new Connection(newEndpoint, config);
            setConnection(newConnection);
        } else if (cluster) {
            const clusterUrl = clusterApiUrl(cluster);
            const newConnection = new Connection(clusterUrl);
            setConnection(newConnection);
        }
        
    };

    return <ConnectionContext.Provider value={{ connection, updateConnection }}>{children}</ConnectionContext.Provider>;
};
