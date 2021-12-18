export interface WalletConfig {
    localStorageKey?: string;
    autoConnect?: boolean;
    onError?: (error: unknown) => void;
}
