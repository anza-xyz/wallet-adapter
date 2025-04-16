import { BaseWalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base';
import { act } from 'react';

export abstract class MockWalletAdapter extends BaseWalletAdapter {
    connectedValue = false;
    get connected() {
        return this.connectedValue;
    }
    readyStateValue: WalletReadyState = WalletReadyState.Installed;
    get readyState() {
        return this.readyStateValue;
    }
    connecting = false;
    connect = jest.fn(async () => {
        this.connecting = true;
        this.connecting = false;
        this.connectedValue = true;
        act(() => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.emit('connect', this.publicKey!);
        });
    });
    disconnect = jest.fn(async () => {
        this.connecting = false;
        this.connectedValue = false;
        act(() => {
            this.emit('disconnect');
        });
    });
    sendTransaction = jest.fn();
    supportedTransactionVersions = null;
    autoConnect = jest.fn();
}
