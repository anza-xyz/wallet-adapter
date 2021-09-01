import { WalletStore } from './wallet.store';
import { WALLET_CONFIG } from './wallet.tokens';
import { WalletConfig } from './wallet.types';

export const walletProvider = (config?: WalletConfig) => [
    {
        provide: WALLET_CONFIG,
        useValue: {
            wallets: config?.wallets || [],
            autoConnect: config?.autoConnect || false,
            localStorageKey: config?.localStorageKey || 'walletName',
        },
    },
    WalletStore,
];
