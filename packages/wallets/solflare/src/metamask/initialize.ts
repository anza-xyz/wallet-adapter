import type { SolflareMetaMaskConfig } from '@solflare-wallet/metamask-sdk';
import { registerWallet } from './register.js';
import { SolflareMetaMaskWallet } from './wallet.js';
import { detectEthereumProvider } from './detect.js';

let isInitialized = false;

export function initialize(config?: SolflareMetaMaskConfig): void {
    if (isInitialized) {
        return;
    }

    isInitialized = true;

    registerWallet(new SolflareMetaMaskWallet(config));
}

export async function initializeWhenDetected(config?: SolflareMetaMaskConfig): Promise<void> {
    if (isInitialized) {
        return;
    }

    if (!(await detectEthereumProvider())) {
        return;
    }

    initialize(config);
}
