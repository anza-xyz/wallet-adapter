// This is copied from @wallet-standard/wallet

import type {
    DEPRECATED_WalletsWindow,
    Wallet,
    WalletEventsWindow,
    WindowRegisterWalletEvent,
    WindowRegisterWalletEventCallback,
} from '@wallet-standard/base';

export function registerWallet(wallet: Wallet): void {
    const callback: WindowRegisterWalletEventCallback = ({ register }) => register(wallet);
    try {
        (window as WalletEventsWindow).dispatchEvent(new RegisterWalletEvent(callback));
    } catch (error) {
        console.error('wallet-standard:register-wallet event could not be dispatched\n', error);
    }
    try {
        (window as WalletEventsWindow).addEventListener('wallet-standard:app-ready', ({ detail: api }) =>
            callback(api)
        );
    } catch (error) {
        console.error('wallet-standard:app-ready event listener could not be added\n', error);
    }
}

class RegisterWalletEvent extends Event implements WindowRegisterWalletEvent {
    readonly #detail: WindowRegisterWalletEventCallback;

    get detail() {
        return this.#detail;
    }

    get type() {
        return 'wallet-standard:register-wallet' as const;
    }

    constructor(callback: WindowRegisterWalletEventCallback) {
        super('wallet-standard:register-wallet', {
            bubbles: false,
            cancelable: false,
            composed: false,
        });
        this.#detail = callback;
    }

    /** @deprecated */
    preventDefault(): never {
        throw new Error('preventDefault cannot be called');
    }

    /** @deprecated */
    stopImmediatePropagation(): never {
        throw new Error('stopImmediatePropagation cannot be called');
    }

    /** @deprecated */
    stopPropagation(): never {
        throw new Error('stopPropagation cannot be called');
    }
}

/** @deprecated */
export function DEPRECATED_registerWallet(wallet: Wallet): void {
    registerWallet(wallet);
    try {
        ((window as DEPRECATED_WalletsWindow).navigator.wallets ||= []).push(({ register }) => register(wallet));
    } catch (error) {
        console.error('window.navigator.wallets could not be pushed\n', error);
    }
}
