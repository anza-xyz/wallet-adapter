import { BaseSignerWalletAdapter, WalletName, WalletReadyState } from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';
import { ClientOptions, ClientTypes } from '@walletconnect/types';
export declare enum WalletConnectChainID {
    Mainnet = "solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ",
    Devnet = "solana:8E9rvCKLFQia2Y35HXjjpWzj8weVo44K"
}
export declare enum WalletConnectRPCMethod {
    signTransaction = "solana_signTransaction",
    signMessage = "solana_signMessage"
}
export interface WalletConnectWalletAdapterConfig {
    options: ClientOptions;
    params?: ClientTypes.ConnectParams;
}
export declare const WalletConnectWalletName: WalletName<string>;
export declare class WalletConnectWalletAdapter extends BaseSignerWalletAdapter {
    name: WalletName<string>;
    url: string;
    icon: string;
    private _publicKey;
    private _connecting;
    private _options;
    private _params;
    private _client;
    private _session;
    private _readyState;
    constructor(config: WalletConnectWalletAdapterConfig);
    get publicKey(): PublicKey | null;
    get connecting(): boolean;
    get readyState(): WalletReadyState;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private signTx;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signMessage(message: Uint8Array): Promise<Uint8Array>;
    private _disconnected;
}
