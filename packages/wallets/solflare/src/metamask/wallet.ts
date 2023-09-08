import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { SOLANA_DEVNET_CHAIN, SOLANA_MAINNET_CHAIN, SOLANA_TESTNET_CHAIN } from '@solana/wallet-standard-chains';
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
import type { default as SolflareMetaMask } from '@solflare-wallet/metamask-sdk';
import type { Wallet } from '@wallet-standard/base';
import {
    StandardConnect,
    type StandardConnectFeature,
    type StandardConnectMethod,
    StandardDisconnect,
    type StandardDisconnectFeature,
    type StandardDisconnectMethod,
    StandardEvents,
    type StandardEventsChangeProperties,
    type StandardEventsFeature,
    type StandardEventsListeners,
    type StandardEventsNames,
    type StandardEventsOnMethod,
} from '@wallet-standard/features';
import { icon } from './icon.js';

export class SolflareMetaMaskWallet implements Wallet {
    readonly #listeners: { [E in StandardEventsNames]?: StandardEventsListeners[E][] } = {};
    readonly #version = '1.0.0' as const;
    readonly #name = 'MetaMask' as const;
    readonly #icon = icon;
    #solflareMetaMask: SolflareMetaMask | null = null;

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
        return [SOLANA_MAINNET_CHAIN, SOLANA_DEVNET_CHAIN, SOLANA_TESTNET_CHAIN] as const;
    }

    get features(): StandardConnectFeature &
        StandardDisconnectFeature &
        StandardEventsFeature &
        SolanaSignAndSendTransactionFeature &
        SolanaSignTransactionFeature &
        SolanaSignMessageFeature {
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
        };
    }

    get accounts() {
        return this.#solflareMetaMask ? this.#solflareMetaMask.standardAccounts : [];
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
        if (!this.#solflareMetaMask) {
            let SolflareMetaMaskClass: typeof SolflareMetaMask;
            try {
                SolflareMetaMaskClass = (await import('@solflare-wallet/metamask-sdk')).default;
            } catch (error: any) {
                throw new Error('Unable to load Solflare MetaMask SDK');
            }
            this.#solflareMetaMask = new SolflareMetaMaskClass();
            this.#solflareMetaMask.on('standard_change', (properties: StandardEventsChangeProperties) =>
                this.#emit('change', properties)
            );
        }

        if (!this.accounts.length) {
            await this.#solflareMetaMask.connect();
        }

        return { accounts: this.accounts };
    };

    #disconnect: StandardDisconnectMethod = async () => {
        if (!this.#solflareMetaMask) return;
        await this.#solflareMetaMask.disconnect();
    };

    #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (...inputs) => {
        if (!this.#solflareMetaMask) throw new WalletNotConnectedError();
        return await this.#solflareMetaMask.standardSignAndSendTransaction(...inputs);
    };

    #signTransaction: SolanaSignTransactionMethod = async (...inputs) => {
        if (!this.#solflareMetaMask) throw new WalletNotConnectedError();
        return await this.#solflareMetaMask.standardSignTransaction(...inputs);
    };

    #signMessage: SolanaSignMessageMethod = async (...inputs) => {
        if (!this.#solflareMetaMask) throw new WalletNotConnectedError();
        return await this.#solflareMetaMask.standardSignMessage(...inputs);
    };
}
