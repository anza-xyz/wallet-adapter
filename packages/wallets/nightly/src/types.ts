import { PublicKey as SolanaPublicKey, Transaction as SolanaTx } from '@solana/web3.js';

export declare class Nightly {
    solana: SolanaNightly;
    private readonly _nightlyEventsMap;
    constructor();
    invalidate(): void;
}

export declare class SolanaNightly {
    isConnected?: boolean
    publicKey: SolanaPublicKey;
    _onDisconnect: () => void;
    private readonly _nightlyEventsMap;
    constructor(eventMap: Map<string, (data: any) => any>);
    connect(onDisconnect?: () => void): Promise<SolanaPublicKey>;
    disconnect(): Promise<void>;
    signTransaction(tx: SolanaTx): Promise<SolanaTx>;
    signAllTransactions(txs: SolanaTx[]): Promise<SolanaTx[]>;
}

export interface NightlyWindow extends Window {
    nightly?: {
        solana?: SolanaNightly
    };
}
