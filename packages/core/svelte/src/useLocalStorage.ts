import type { WalletName } from '@solana/wallet-adapter-wallets';

export function useLocalStorage(key: string, defaultValue: WalletName | undefined = undefined): WalletName | undefined{
    const value = localStorage.getItem(key);
    if (value){
        try {
            return value ? JSON.parse(value) as WalletName : defaultValue;
        } catch (error) {
            console.warn(error);
            return defaultValue;
        }
    } else if (!value && defaultValue) {
        try {
            localStorage.setItem(key, JSON.stringify(defaultValue));
        } catch (error) {
            console.error(error);
        }
    } else if (value === null) {
        localStorage.removeItem(key);
    }
}
