import type { EthereumProvider, WindowWithEthereum } from '@solflare-wallet/metamask-sdk';
import { registerWallet } from '@wallet-standard/wallet';
import { SolflareMetaMaskWallet } from './wallet.js';

let stopPolling = false;

/** @internal */
export function detectAndRegisterSolflareMetaMaskWallet(): boolean {
    // If detected, stop polling.
    if (stopPolling) return true;
    (async function () {
        try {
            // Try to detect, stop polling if detected, and register the wallet.
            if (await isSnapProviderDetected()) {
                if (!stopPolling) {
                    stopPolling = true;
                    registerWallet(new SolflareMetaMaskWallet());
                }
            }
        } catch (error) {
            // Stop polling on unhandled errors (this should never happen).
            stopPolling = true;
        }
    })();
    // Keep polling.
    return false;
}

async function isSnapProviderDetected(): Promise<boolean> {
    try {
        const provider = (window as WindowWithEthereum).ethereum;
        if (!provider) return false;

        const providerProviders = provider.providers;
        if (providerProviders && Array.isArray(providerProviders)) {
            for (const provider of providerProviders) {
                if (await isSnapSupported(provider)) return true;
            }
        }

        const providerDetected = provider.detected;
        if (providerDetected && Array.isArray(providerDetected)) {
            for (const provider of providerDetected) {
                if (await isSnapSupported(provider)) return true;
            }
        }

        return await isSnapSupported(provider);
    } catch (error) {
        return false;
    }
}

async function isSnapSupported(provider: EthereumProvider): Promise<boolean> {
    try {
        await provider.request({ method: 'wallet_getSnaps' });
        return true;
    } catch (error) {
        return false;
    }
}
