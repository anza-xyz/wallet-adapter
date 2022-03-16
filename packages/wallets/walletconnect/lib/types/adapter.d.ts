import { BaseSignerWalletAdapter, WalletName, WalletReadyState } from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';
import { ClientOptions, ClientTypes } from '@walletconnect/types';
export declare enum WalletConnectChainID {
    Mainnet = "solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ",
    Devnet = "solana:8E9rvCKLFQia2Y35HXjjpWzj8weVo44K"
}
export declare enum WalletConnectRPCMethod {
    SOL_SIGN_TRANSACTION = "sol_signTransaction"
}
export interface WalletConnectWalletAdapterConfig {
    options: ClientOptions;
    params?: ClientTypes.ConnectParams;
}
export declare const WalletConnectWalletName: WalletName;
export declare class WalletConnectWalletAdapter extends BaseSignerWalletAdapter {
    name: WalletName;
    url: string;
    icon: string;
    private _publicKey;
    private _connecting;
    private _options;
    private _params;
    private _client;
    private _readyState;
    constructor(config: WalletConnectWalletAdapterConfig);
    get publicKey(): PublicKey | null;
    get connecting(): boolean;
    get readyState(): WalletReadyState;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    private _disconnected;
}
