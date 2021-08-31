import {
    SignerWalletAdapter,
    WalletAdapter,
    WalletAdapterEvents,
} from "@solana/wallet-adapter-base";
import { fromEventPattern, Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

export const fromAdapterEvent =
    (eventName: keyof WalletAdapterEvents) =>
    (source: Observable<WalletAdapter | SignerWalletAdapter>) =>
        source.pipe(
            switchMap((adapter) =>
                fromEventPattern(
                    (addHandler) => adapter.on(eventName, addHandler),
                    (removeHandler) => adapter.off(eventName, removeHandler)
                )
            )
        );
