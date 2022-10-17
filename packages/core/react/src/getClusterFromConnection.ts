import type { Connection, Cluster } from '@solana/web3.js';

export default function getClusterFromConnection(connection?: Connection): Cluster {
    if (!connection) return 'mainnet-beta';
    // HACK: remove casts when https://github.com/solana-labs/solana/pull/28435 lands
    if ((connection as any).cluster) return (connection as any).cluster;
    if (/devnet/i.test(connection.rpcEndpoint)) return 'devnet';
    if (/testnet/i.test(connection.rpcEndpoint)) return 'testnet';
    // HACK: remove casts when https://github.com/solana-labs/solana/pull/28435 lands
    if (/localhost/i.test(connection.rpcEndpoint)) return 'localnet' as Cluster;
    return 'mainnet-beta';
}
