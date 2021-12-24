import { Connection, PublicKey, SendOptions, Signer, Transaction, TransactionSignature } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';
import { WalletError } from './errors';

export { EventEmitter };

export interface WalletAdapterEvents {
    connect(publicKey: PublicKey): void;
    disconnect(): void;
    error(error: WalletError): void;
    readyStateChange(readyState: WalletReadyState): void;
}

export interface SendTransactionOptions extends SendOptions {
    signers?: Signer[];
}

// WalletName is a nominal type that wallet adapters should use, e.g. `'MyCryptoWallet' as WalletName`
// https://medium.com/@KevinBGreene/surviving-the-typescript-ecosystem-branding-and-type-tagging-6cf6e516523d
export type WalletName = string & { __brand__: 'WalletName' };

export interface WalletAdapterProps {
    name: WalletName;
    url: string;
    icon: string;
    readyState: WalletReadyState;
    publicKey: PublicKey | null;
    connecting: boolean;
    connected: boolean;

    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options?: SendTransactionOptions
    ): Promise<TransactionSignature>;
}

export type WalletAdapter = WalletAdapterProps & EventEmitter<WalletAdapterEvents>;

/**
 * A wallet's readiness describes a series of states that the wallet can be in,
 * depending on what kind of wallet it is. An installable wallet (eg. a browser
 * extension like Phantom) might be `Installed` if we've found the Phantom API
 * in the global scope, or `NotDetected` otherwise. A loadable, zero-install
 * runtime (eg. Torus Wallet) might simply signal that it's `Loadable`. Use this
 * metadata to personalize the wallet list for each user (eg. to show their
 * installed wallets first).
 */
export enum WalletReadyState {
    /**
     * User-installable wallets can typically be detected by scanning for an API
     * that they've injected into the global context. If such an API is present,
     * we consider the wallet to have been installed.
     */
    Installed = 'Installed',
    NotDetected = 'NotDetected',
    /**
     * Loadable wallets are always available to you. Since you can load them at
     * any time, it's meaningless to say that they have been detected.
     */
    Loadable = 'Loadable',
    /**
     * If a wallet is not supported on a given platform (eg. server-rendering, or
     * mobile) then it will stay in the `Unsupported` state.
     */
    Unsupported = 'Unsupported',
}

export abstract class BaseWalletAdapter extends EventEmitter<WalletAdapterEvents> implements WalletAdapter {
    abstract name: WalletName;
    abstract url: string;
    abstract icon: string;
    abstract readyState: WalletReadyState;
    abstract publicKey: PublicKey | null;
    abstract connecting: boolean;

    get connected(): boolean {
        return !!this.publicKey;
    }

    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options?: SendTransactionOptions
    ): Promise<TransactionSignature>;
}

export function scopePollingDetectionStrategy(performDetection: () => boolean): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (document.readyState === 'complete') {
        performDetection();
        return;
    }
    function listener() {
        window.removeEventListener('load', listener);
        performDetection();
    }
    window.addEventListener('load', listener);
}
