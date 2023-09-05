import {
    SolanaSignAndSendTransaction,
    type SolanaSignAndSendTransactionFeature,
    type SolanaSignAndSendTransactionMethod,
    SolanaSignMessage,
    type SolanaSignMessageFeature,
    type SolanaSignMessageMethod,
    SolanaSignTransaction,
    type SolanaSignTransactionFeature,
    type SolanaSignTransactionMethod,
} from '@solana/wallet-standard-features';
import type { Wallet } from '@wallet-standard/base';
import {
    StandardConnect,
    type StandardConnectFeature,
    type StandardConnectMethod,
    StandardDisconnect,
    type StandardDisconnectFeature,
    type StandardDisconnectMethod,
    StandardEvents,
    type StandardEventsFeature,
    type StandardEventsListeners,
    type StandardEventsNames,
    type StandardEventsOnMethod,
} from '@wallet-standard/features';
import { icon } from './icon.js';
import type { default as SolflareMetaMask, SolflareMetaMaskConfig } from '@solflare-wallet/metamask-sdk';

export const SolflareMetaMaskNamespace = 'solflareMetaMask:';

export type SolflareMetaMaskFeature = {
    [SolflareMetaMaskNamespace]: {
        solflareMetaMask: SolflareMetaMask | null;
    };
};

export class SolflareMetaMaskWallet implements Wallet {
    readonly #listeners: { [E in StandardEventsNames]?: StandardEventsListeners[E][] } = {};
    readonly #version = '1.0.0' as const;
    readonly #name = 'MetaMask' as const;
    readonly #icon = icon;
    #instance: SolflareMetaMask | null = null;
    readonly #config: SolflareMetaMaskConfig = {};

    get version() {
        return this.#version;
    }

    get name() {
        return this.#name;
    }

    get icon() {
        return this.#icon;
    }

    get chains() {
        return ['solana:mainnet', 'solana:devnet', 'solana:testnet', 'solana:localnet'] as const;
    }

    get features(): StandardConnectFeature &
        StandardDisconnectFeature &
        StandardEventsFeature &
        SolanaSignAndSendTransactionFeature &
        SolanaSignTransactionFeature &
        SolanaSignMessageFeature &
        SolflareMetaMaskFeature {
        return {
            [StandardConnect]: {
                version: '1.0.0',
                connect: this.#connect,
            },
            [StandardDisconnect]: {
                version: '1.0.0',
                disconnect: this.#disconnect,
            },
            [StandardEvents]: {
                version: '1.0.0',
                on: this.#on,
            },
            [SolanaSignAndSendTransaction]: {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy', 0],
                signAndSendTransaction: this.#signAndSendTransaction,
            },
            [SolanaSignTransaction]: {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy', 0],
                signTransaction: this.#signTransaction,
            },
            [SolanaSignMessage]: {
                version: '1.0.0',
                signMessage: this.#signMessage,
            },
            [SolflareMetaMaskNamespace]: {
                solflareMetaMask: this.#instance,
            },
        };
    }

    get accounts() {
        return this.#instance ? this.#instance.standardAccounts : [];
    }

    constructor(config?: SolflareMetaMaskConfig) {
        this.#config = config || {};
    }

    #on: StandardEventsOnMethod = (event, listener) => {
        this.#listeners[event]?.push(listener) || (this.#listeners[event] = [listener]);
        return (): void => this.#off(event, listener);
    };

    #emit<E extends StandardEventsNames>(event: E, ...args: Parameters<StandardEventsListeners[E]>): void {
        // eslint-disable-next-line prefer-spread
        this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
    }

    #off<E extends StandardEventsNames>(event: E, listener: StandardEventsListeners[E]): void {
        this.#listeners[event] = this.#listeners[event]?.filter((existingListener) => listener !== existingListener);
    }

    #connect: StandardConnectMethod = async () => {
        if (!this.#instance) {
            let SDK: typeof SolflareMetaMask;
            try {
                SDK = (await import('@solflare-wallet/metamask-sdk')).default;
            } catch (error: any) {
                throw new Error('Unable to load Solflare MetaMask SDK');
            }

            this.#instance = new SDK(this.#config);

            this.#instance.on('standard_change', (data) => this.#emit('change', data));
        }

        if (!this.accounts.length) {
            await this.#instance.connect();
        }

        return { accounts: this.accounts };
    };

    #disconnect: StandardDisconnectMethod = async () => {
        if (!this.#instance) return;
        await this.#instance.disconnect();
    };

    #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (...inputs) => {
        if (!this.#instance) throw new Error('not connected');
        return await this.#instance.standardSignAndSendTransaction(...inputs);
    };

    #signTransaction: SolanaSignTransactionMethod = async (...inputs) => {
        if (!this.#instance) throw new Error('not connected');
        return await this.#instance.standardSignTransaction(...inputs);
    };

    #signMessage: SolanaSignMessageMethod = async (...inputs) => {
        if (!this.#instance) throw new Error('not connected');
        return await this.#instance.standardSignMessage(...inputs);
    };
}
