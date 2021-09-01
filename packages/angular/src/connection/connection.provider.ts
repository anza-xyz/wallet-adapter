import { ConnectionConfig } from '@solana/web3.js';

import { ConnectionStore } from './connection.store';
import { CONNECTION_CONFIG } from './connection.tokens';

export const connectionProvider = (config?: ConnectionConfig) => [
    {
        provide: CONNECTION_CONFIG,
        useValue: config || { commitment: 'confirmed' },
    },
    ConnectionStore,
];
