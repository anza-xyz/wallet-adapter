import { registerWallet } from '@wallet-standard/wallet';
import { SolflareMetaMaskWallet } from './wallet.js';

let stopPolling = false;
let counter = 10;

/** @internal */
export function detectAndRegisterSolflareMetaMaskWallet(): boolean {
    // If detected, stop polling.
    if (stopPolling || counter <= 0) return true;
    (async function () {
        try {
            counter--;
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

async function metamaskRequest(request: Record<string, any>) {
    return new Promise((resolve, reject) => {
        const id = Math.floor(Math.random() * 1000000).toString();

        function handleMessage(event: MessageEvent) {
            const message = event.data;

            if (
                message?.target === 'metamask-inpage' &&
                message.data?.name === 'metamask-provider' &&
                message.data.data?.id === id
            ) {
                window.removeEventListener('message', handleMessage);

                if (message?.data.data.error) {
                    reject(message.data.data.error.message);
                } else {
                    resolve(message.data.data.result);
                }
            }
        }

        window.addEventListener('message', handleMessage);

        window.postMessage(
            {
                target: 'metamask-contentscript',
                data: {
                    name: 'metamask-provider',
                    data: {
                        ...request,
                        jsonrpc: '2.0',
                        id,
                    },
                },
            },
            window.location.origin
        );
    });
}

async function isSnapSupported(): Promise<boolean> {
    try {
        const snaps = await Promise.race([
            metamaskRequest({ method: 'wallet_getSnaps' }),
            new Promise((resolve, reject) => setTimeout(() => reject('MetaMask provider not found'), 1000)),
        ]);

        return typeof snaps === 'object';
    } catch (error) {
        return false;
    }
}
