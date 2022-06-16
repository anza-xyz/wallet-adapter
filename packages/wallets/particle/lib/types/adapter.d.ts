import { BaseMessageSignerWalletAdapter, WalletName, WalletReadyState } from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';
import type { Config } from '@particle-network/auth';
export interface ParticleAdapterConfig extends Config {
}
export declare const ParticleName: WalletName<"Particle">;
export declare class ParticleAdapter extends BaseMessageSignerWalletAdapter {
    name: WalletName<"Particle">;
    url: string;
    icon: string;
    private _connecting;
    private _wallet;
    private _publicKey;
    private _config;
    private _readyState;
    constructor(config: ParticleAdapterConfig);
    get publicKey(): PublicKey | null;
    get connecting(): boolean;
    get connected(): boolean;
    get readyState(): WalletReadyState;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signMessage(message: Uint8Array): Promise<Uint8Array>;
}
