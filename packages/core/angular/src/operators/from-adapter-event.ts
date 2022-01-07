import { WalletAdapter, WalletAdapterEvents } from '@solana/wallet-adapter-base';
import { fromEventPattern, Observable } from 'rxjs';

type FirstParameter<T> = T extends () => unknown
    ? void
    : T extends (arg1: infer U, ...args: unknown[]) => unknown
    ? U
    : unknown;

export const fromAdapterEvent = <
    EventName extends keyof WalletAdapterEvents,
    CallbackParameter extends FirstParameter<WalletAdapterEvents[EventName]>
>(
    adapter: WalletAdapter,
    eventName: EventName
): Observable<CallbackParameter> =>
    fromEventPattern(
        (addHandler) => adapter.on(eventName, addHandler),
        (removeHandler) => adapter.off(eventName, removeHandler)
    );
