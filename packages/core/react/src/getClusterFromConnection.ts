import type { Connection, Cluster } from '@solana/web3.js';

export default function getClusterFromConnection(connection?: Connection): Cluster {
    if (!connection) return 'mainnet-beta';
    if (/devnet/i.test(connection.rpcEndpoint)) return 'devnet';
    if (/testnet/i.test(connection.rpcEndpoint)) return 'testnet';
    return 'mainnet-beta';
}
