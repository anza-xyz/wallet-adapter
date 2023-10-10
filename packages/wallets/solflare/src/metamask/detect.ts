import { registerWallet } from '@wallet-standard/wallet';
import { SolflareMetaMaskWallet } from './wallet.js';

/** @internal */
export async function detectAndRegisterSolflareMetaMaskWallet(): Promise<void> {
    const id = 'solflare-detect-metamask';

    function onMessage(event: MessageEvent) {
        const message = event.data;
        if (
            message?.target === 'metamask-inpage' &&
            message.data?.name === 'metamask-provider' &&
            message.data.data?.id === id
        ) {
            window.removeEventListener('message', onMessage);

            if (!message.data.data.error) {
                registerWallet(new SolflareMetaMaskWallet());
            }
        }
    }

    window.addEventListener('message', onMessage);

    window.postMessage(
        {
            target: 'metamask-contentscript',
            data: {
                name: 'metamask-provider',
                data: {
                    id,
                    jsonrpc: '2.0',
                    method: 'wallet_getSnaps',
                },
            },
        },
        window.location.origin
    );

    window.setTimeout(() => window.removeEventListener('message', onMessage), 5000);
}
