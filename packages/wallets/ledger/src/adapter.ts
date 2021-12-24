import type Transport from '@ledgerhq/hw-transport';
import {
    Adapter,
    BaseSignerWalletAdapter,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletLoadError,
    WalletName,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getDerivationPath, getPublicKey, signTransaction } from './util';

export interface LedgerWalletAdapterConfig {
    derivationPath?: Buffer;
}

export const LedgerWalletName = 'Ledger' as WalletName;

export class LedgerWalletAdapter extends BaseSignerWalletAdapter {
    name = LedgerWalletName;
    url = 'https://ledger.com';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMzUgMzUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iI2ZmZiI+PHBhdGggZD0ibTIzLjU4OCAwaC0xNnYyMS41ODNoMjEuNnYtMTZhNS41ODUgNS41ODUgMCAwIDAgLTUuNi01LjU4M3oiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUuNzM5KSIvPjxwYXRoIGQ9Im04LjM0MiAwaC0yLjc1N2E1LjU4NSA1LjU4NSAwIDAgMCAtNS41ODUgNS41ODV2Mi43NTdoOC4zNDJ6Ii8+PHBhdGggZD0ibTAgNy41OWg4LjM0MnY4LjM0MmgtOC4zNDJ6IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDUuNzM5KSIvPjxwYXRoIGQ9Im0xNS4xOCAyMy40NTFoMi43NTdhNS41ODUgNS41ODUgMCAwIDAgNS41ODUtNS42di0yLjY3MWgtOC4zNDJ6IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMS40NzggMTEuNDc4KSIvPjxwYXRoIGQ9Im03LjU5IDE1LjE4aDguMzQydjguMzQyaC04LjM0MnoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUuNzM5IDExLjQ3OCkiLz48cGF0aCBkPSJtMCAxNS4xOHYyLjc1N2E1LjU4NSA1LjU4NSAwIDAgMCA1LjU4NSA1LjU4NWgyLjc1N3YtOC4zNDJ6IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDExLjQ3OCkiLz48L2c+PC9zdmc+';

    private _derivationPath: Buffer;
    private _connecting: boolean;
    private _transport: Transport | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof navigator === 'undefined' || !navigator.hid ? WalletReadyState.Unsupported : WalletReadyState.Loadable;

    constructor(config: LedgerWalletAdapterConfig = {}) {
        super();
        this._derivationPath = config.derivationPath || getDerivationPath(0, 0);
        this._connecting = false;
        this._transport = null;
        this._publicKey = null;
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get readyState(): WalletReadyState {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState === WalletReadyState.Unsupported) throw new WalletNotReadyError();

            this._connecting = true;

            let TransportWebHID: typeof import('@ledgerhq/hw-transport-webhid');
            try {
                TransportWebHID = await import('@ledgerhq/hw-transport-webhid');
            } catch (error: any) {
                throw new WalletLoadError(error?.message, error);
            }

            let transport: Transport;
            try {
                transport = await TransportWebHID.default.create();
            } catch (error: any) {
                throw new WalletConnectionError(error?.message, error);
            }

            let publicKey: PublicKey;
            try {
                publicKey = await getPublicKey(transport, this._derivationPath);
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            transport.on('disconnect', this._disconnected);

            this._transport = transport;
            this._publicKey = publicKey;

            this.emit('connect', publicKey);
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        const transport = this._transport;
        if (transport) {
            transport.off('disconnect', this._disconnected);

            this._transport = null;
            this._publicKey = null;

            try {
                await transport.close();
            } catch (error: any) {
                this.emit('error', new WalletDisconnectionError(error?.message, error));
            }
        }

        this.emit('disconnect');
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            const transport = this._transport;
            const publicKey = this._publicKey;
            if (!transport || !publicKey) throw new WalletNotConnectedError();

            try {
                const signature = await signTransaction(transport, transaction, this._derivationPath);
                transaction.addSignature(publicKey, signature);
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }

            return transaction;
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        try {
            const transport = this._transport;
            const publicKey = this._publicKey;
            if (!transport || !publicKey) throw new WalletNotConnectedError();

            try {
                const derivationPath = this._derivationPath;
                for (const transaction of transactions) {
                    const signature = await signTransaction(transport, transaction, derivationPath);
                    transaction.addSignature(publicKey, signature);
                }
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }

            return transactions;
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    private _disconnected = () => {
        const transport = this._transport;
        if (transport) {
            transport.off('disconnect', this._disconnected);

            this._transport = null;
            this._publicKey = null;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };
}
