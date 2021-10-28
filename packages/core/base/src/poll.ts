import { WalletAdapter } from './adapter';
import { ChangerWalletAdapter } from './changer';

export function poll(callback: () => boolean | Promise<boolean>, interval: number, count: number): void {
    if (count > 0) {
        setTimeout(async () => {
            const done = await callback();
            if (!done) poll(callback, interval, count - 1);
        }, interval);
    }
}

export function pollUntilReady(adapter: WalletAdapter, pollInterval: number, pollCount: number): void {
    poll(
        () => {
            const { ready } = adapter;
            if (ready) {
                if (!adapter.emit('ready')) {
                    console.warn(`${adapter.constructor.name} is ready but no listener was registered`);
                }
            }
            return ready;
        },
        pollInterval,
        pollCount
    );
}

export function pollUntilBreak(adapter: ChangerWalletAdapter, callback: (adapter: ChangerWalletAdapter) => Promise<boolean>, pollInterval: number): void {
    setTimeout(async () => {
        const done = await callback(adapter);
        if (!done) pollUntilBreak(adapter, callback, pollInterval);
    }, pollInterval, adapter);
}
