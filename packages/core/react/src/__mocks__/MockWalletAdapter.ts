import { BaseWalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base';
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.emit('connect', this.publicKey!);
    });
    disconnect = jest.fn(async () => {
        this.connecting = false;
        this.connectedValue = false;
        this.emit('disconnect');
    });
    sendTransaction = jest.fn();
    supportedTransactionVersions = null;
    autoConnect = jest.fn();
}
