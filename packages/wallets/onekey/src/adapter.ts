import {
    BaseMessageSignerWalletAdapter,
    WalletAdapterNetwork, WalletError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';
import { PhantomWallet, PhantomWalletAdapter } from './phantom';
import { SolletWallet, SolletWalletAdapter } from './sollet';

interface OneKeyContainer {
    solana?: PhantomWallet;
    sollet?: SolletWallet;
}

interface OneKeyWindow extends Window {
    $onekey?: OneKeyContainer;
    solana?: PhantomWallet;
    sollet?: SolletWallet;
}

declare const window: OneKeyWindow;

export interface OneKeyWalletAdapterConfig {
    pollInterval?: number;
    pollCount?: number;
    provider?: string | SolletWallet;
    network?: WalletAdapterNetwork;
}

function getInjectedProvider(name: 'solana' | 'sollet'): any {
    if (typeof window !== 'undefined') {
        const provider = window?.$onekey?.[name] ?? window?.[name];
        if (provider?.isOneKey) {
            return provider;
        }
    }
    return null;
}

function getPhantom(): PhantomWallet | null {
    return getInjectedProvider('solana');
}

function getSollet(): SolletWallet | null {
    return getInjectedProvider('sollet');
}

export class OneKeyWalletAdapter extends BaseMessageSignerWalletAdapter {
    constructor(config: OneKeyWalletAdapterConfig = {}) {
        super();
        const phantom = getPhantom();
        const sollet = getSollet();
        if (phantom) {
            return new PhantomWalletAdapter(config, getPhantom);
        }
        if (sollet) {
            return new SolletWalletAdapter(config, getSollet);
        }
        return new PhantomWalletAdapter(config, getPhantom);
    }

    get publicKey(): PublicKey | null {
        return null
    }

    get ready(): boolean {
        return false
    }

    get connecting(): boolean {
        return false
    }

    get connected(): boolean {
        return false
    }

    connect(): Promise<void> {
        return Promise.resolve(undefined);
    }

    disconnect(): Promise<void> {
        return Promise.resolve(undefined);
    }

    signAllTransactions(transaction: Transaction[]): Promise<Transaction[]> {
        return Promise.resolve([]);
    }

    signMessage(message: Uint8Array): Promise<Uint8Array> {
        throw new WalletError()
    }

    signTransaction(transaction: Transaction): Promise<Transaction> {
        throw new WalletError()
    }

}
