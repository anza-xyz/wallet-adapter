import { MessageSignerWalletAdapter, WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { defer, from, Observable, throwError } from 'rxjs';

export const messageSigner = (
    adapter: MessageSignerWalletAdapter,
    connected: boolean
): ((message: Uint8Array) => Observable<Uint8Array>) => {
    return (message: Uint8Array) => {
        if (!connected) {
            return throwError(new WalletNotConnectedError());
        }

        return from(defer(() => adapter.signMessage(message)));
    };
};
