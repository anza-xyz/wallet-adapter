import { WalletAdapter, WalletAdapterEvents } from '@solana/wallet-adapter-base';
import { fromEventPattern, Observable } from 'rxjs';

export const fromAdapterEvent = <T>(adapter: WalletAdapter, eventName: keyof WalletAdapterEvents): Observable<T> =>
    fromEventPattern(
        (addHandler) => adapter.on(eventName, addHandler),
        (removeHandler) => adapter.off(eventName, removeHandler)
    );
