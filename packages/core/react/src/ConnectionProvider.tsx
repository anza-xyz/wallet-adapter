import type { Cluster, ConnectionConfig } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import type { FC, ReactNode } from 'react';
import React, { useMemo } from 'react';
import { ConnectionContext } from './useConnection.js';

export interface ConnectionProviderProps {
    children: ReactNode;
    endpoint: string;
    // HACK: remove intersection when https://github.com/solana-labs/solana/pull/28435 lands
    config?: ConnectionConfig & { cluster?: Cluster };
}

export const ConnectionProvider: FC<ConnectionProviderProps> = ({
    children,
    endpoint,
    config = { commitment: 'confirmed' },
}) => {
    const connection = useMemo(() => new Connection(endpoint, config), [endpoint, config]);

    return <ConnectionContext.Provider value={{ connection }}>{children}</ConnectionContext.Provider>;
};
