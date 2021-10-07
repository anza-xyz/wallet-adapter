import type { WalletName } from '@solana/wallet-adapter-wallets';

export function useLocalStorage(key: string, defaultValue: WalletName | null = null): WalletName | null {
    const value = localStorage.getItem(key);
    if (value){
        return JSON.parse(value)
    } else if (!value && defaultValue) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return null
    }
}
