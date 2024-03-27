import { registerWallet } from '@wallet-standard/wallet';
import { SolflareMetaMaskWallet } from './wallet.js';

let registered = false;

function register() {
    if (registered) return;
    registerWallet(new SolflareMetaMaskWallet());
    registered = true;
}

/** @internal */
export async function detectAndRegisterSolflareMetaMaskWallet(): Promise<void> {
    const id = 'solflare-detect-metamask';

    function postMessage() {
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
    }

    function onMessage(event: MessageEvent) {
        const message = event.data;
        if (message?.target === 'metamask-inpage' && message.data?.name === 'metamask-provider') {
            if (message.data.data?.id === id) {
                window.removeEventListener('message', onMessage);

                if (!message.data.data.error) {
                    register();
                }
            } else {
                postMessage();
            }
        }
    }

    window.addEventListener('message', onMessage);
    window.setTimeout(() => window.removeEventListener('message', onMessage), 5000);

    postMessage();
}
