import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Connection } from '@solana/web3.js';

export interface ConnectionState {
    connection: Connection | null;
    network: WalletAdapterNetwork;
    endpoint: string;
}
