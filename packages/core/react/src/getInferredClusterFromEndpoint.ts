import type { Cluster } from '@solana-mobile/mobile-wallet-adapter-protocol';

export default function getInferredClusterFromEndpoint(endpoint?: string): Cluster {
    if (!endpoint) {
        return 'mainnet-beta';
    }
    if (/devnet/i.test(endpoint)) {
        return 'devnet';
    } else if (/testnet/i.test(endpoint)) {
        return 'testnet';
    } else {
        return 'mainnet-beta';
    }
}
