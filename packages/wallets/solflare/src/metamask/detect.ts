import type { MetaMaskInpageProvider } from '@metamask/providers';
import { registerWallet } from '@wallet-standard/wallet';
import { SolflareMetaMaskWallet } from './wallet.js';

let providerInstance: MetaMaskInpageProvider | null = null;

let stopPolling = false;

/** @internal */
export function detectAndRegisterSolflareMetaMaskWallet(): boolean {
    // If detected, stop polling.
    if (stopPolling) return true;
    (async function () {
        try {
            // Try to detect, stop polling if detected, and register the wallet.
            if (await isSnapSupported()) {
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

async function getMetamaskProvider(): Promise<MetaMaskInpageProvider> {
    if (providerInstance) {
        return providerInstance;
    }

    const { WindowPostMessageStream } = await import('./WindowPostMessageStream.js');
    const { MetaMaskInpageProvider } = await import('@metamask/providers');

    const metamaskStream = new WindowPostMessageStream({
        name: 'metamask-inpage',
        target: 'metamask-contentscript',
    }) as any;

    providerInstance = new MetaMaskInpageProvider(metamaskStream, {
        shouldSendMetadata: false,
    });

    return providerInstance;
}

async function isSnapSupported(): Promise<boolean> {
    try {
        const provider = await getMetamaskProvider();

        const snaps = await Promise.race([
            provider.request({ method: 'wallet_getSnaps' }),
            new Promise((resolve, reject) => setTimeout(() => reject('MetaMask provider not found'), 1000)),
        ]);

        return typeof snaps === 'object';
    } catch (error) {
        return false;
    }
}
