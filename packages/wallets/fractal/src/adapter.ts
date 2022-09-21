import type { SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
import { BaseWalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base';
import type { Connection, Transaction, TransactionSignature } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

export const FractalWalletName = 'Fractal Wallet' as WalletName<'Fractal Wallet'>;

export class FractalWalletAdapter extends BaseWalletAdapter {
    name = FractalWalletName;
    url = 'https://github.com/solana-labs/wallet-adapter#usage';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDEwMDAiPjxwYXRoIGQ9Ik0zNDIuMjQgNzYzLjkzVjI0My44Mkg3MTV2MTEyLjY5SDQ4MXYxMTUuNThoMTgydjExMi42OUg0ODF2MTc5LjE1WiIgc3R5bGU9ImZpbGw6I2RlMzU5YyIvPjwvc3ZnPg==';
    readonly supportedTransactionVersions = null;
    private _publicKey: PublicKey | null = null;

    constructor() {
        super();
    }

    get connecting() {
        return false;
    }

    get publicKey() {
        return this._publicKey;
    }

    get readyState() {
        return WalletReadyState.Installed;
    }

    async connect(): Promise<void> {
        this._publicKey = PublicKey.default;
        this.emit('connect', this._publicKey);
    }

    async disconnect(): Promise<void> {
        this._publicKey = null;
        this.emit('disconnect');
    }

    async sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        console.debug(
            'FakeWallet: `sendTransaction()` was called. ' +
                'Transaction was not actually sent to the network. ' +
                'Returning `itsFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFake` as the signature.'
        );
        return 'itsFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFakeFake';
    }
}
