import type {EventEmitter, SendTransactionOptions, WalletName} from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    isVersionedTransaction,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSendTransactionError,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type {
    Connection,
    SendOptions,
    Transaction,
    TransactionSignature,
    TransactionVersion,
    VersionedTransaction,
} from '@solana/web3.js';
import {PublicKey} from '@solana/web3.js';

interface OnekeyWalletEvents {
    connect(...args: unknown[]): unknown;

    disconnect(...args: unknown[]): unknown;

    accountChanged(newPublicKey: PublicKey): unknown;
}

interface OnekeyWallet extends EventEmitter<OnekeyWalletEvents> {
    publicKey?: { toBytes(): Uint8Array };
    isConnected: boolean;

    signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;

    signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;

    signAndSendTransaction<T extends Transaction | VersionedTransaction>(
        transaction: T,
        options?: SendOptions
    ): Promise<{ signature: TransactionSignature }>;

    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;

    connect(): Promise<void>;

    disconnect(): Promise<void>;
}

interface OnekeyWindow extends Window {
    $onekey?: {
        solana?: OnekeyWallet;
    };
}

declare const window: OnekeyWindow;

export interface OnekeyWalletAdapterConfig {
}

export const OnekeyWalletName = 'OneKey' as WalletName<'OneKey'>;

export class OnekeyWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = OnekeyWalletName;
    url = 'https://onekey.so';
    icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAvUSURBVHgB7Z1NcFPXFcfPeU8iNjZUhIYpoQGRzgD+oIjJpF10gSj2THYx7bpgtu0C2GWywV6kZYeZTruNnXZd7F0mJmBmumiSZlAGbEMmAwoN0IFkUMBgB0vv5J4nPSHL+riS3tPTfe/+ZsCW9J6k8fnfc8499wtBcUZuJ2JPV1fjmDXihBAji+IEtItfQ8Q4AsTEbzHnevFavPY7Ykbckylcmy48mTEA0xbR92hgmp9HkzI90Wh6encqAwqDoAhs6KWVbALISBDlDhiICQKMCzPFwFdQCIBSQiApC/BrQCvV2xVJqSKMjhVAcnFfPArRpGVZhww0kvVbbmch/rApIEyJX6+Yhjn3YV8qDR1IRwlgaHEwaRC+TaLBq2bwejiCIIOmLvZdn4MOwXcBOEa3AEb9d+ftAUU+IRKMuU4Qgy8CKMTzk2DBiPgGCQgxBTGM+xUm2iqAouEJT4WltTcCEk4KIYy3UwhtEYBt+OXcGWH0U6CpSzuF4KkAdItvEYQxkSOMg4d4JgBO7oSS3w9aNt9uOEcQRjr9Uf+1afAA1wWg3b03iELTxMZuc9ztApOrAhieTyQAcxd0q/cG9gYmmofdzA0McIkjiwPHCXOXtfG9g/+2WcpeHVoYcM27uiIAEe/PcOaqE722wINb5/hvDi7QcgiwvwjBGGjajwu9hJYEMLy4/30iGgWNb7DnnR24dgKapOkQwC1fG99/CGm0lXDQlAfQbr8DaTIcNCyA4RuDJ8mCCdB0HGTS6Md756cauachAby1mBDdkNxVne13LBmM0OHZPfMp2RukcwCu8OUod1kbv6OJQda4wLaSvUFaAFze1UWezodt9MwuxcshFQKOLOwfQaALoFEHhMMys42kPIC46BxolIJHYmVCQV0B2P197fqVg2229Cxbd8ygZgjIZ/3Z26BRlUxvd2R3rSHkmh4gZ+VcGXDQ+EasXkJY1QOo2PpX7q7Cf0dvQau8/GYv9P95BwQF4QW2VPMCkWo32a1fmYVjeR5eemyLoFWWdzyHIFHIBcYqvVYxBHDr50EGUIx7049AUwGEk9V6BBUFIFp/EhSDW/6TxRXQVCRWrUdQOQlEUC75Y/evqQ4ivF3p+XUC4OncKvb7tfuvDQEk2Lblz68TAFp4HBRDu385kGCk/Ln1IQAhCYrx6LOnoKmP8ALrGvcaAWj3H3hi5WFgTR2A3b/o/oFqdO/YAN1HN9S8Zvnuc3j0qfYUhTAw5zxeIwDR+pVcq9//Xv2qHRv/80/1sIaQAPcGil3CYgjg4k/YN2sIAxzief8l53FRACoWfzTNEbWiSef30iTwEGhCgWVYRVsXBaBq/Nc0jkFGsvg7/5e8KgYKdPwPDZwHOINDtgAiXVlt/JBh77oKTggg7f5DR8HmtgDIwjhoQgUhHOCftgDQyD/QhAeDsCQEgE4Aw4Yo+Mf5p2H3AOxtRzQhI8Y9ASO6Ia8ETfjggzZETSCrW39IQTLiBuoeQGihLMQMve4vvLDtDSKdAIYVMmiXgYi7QBNaDJEJaA8QUpAwHoGQwPMGX//TNrlrX90AYYDPVIwgIB+0CEGna0dUWgDhAWOu7RauURPuBuocIMRwDhAKAWSfWPBkcRmWbq7AkxsrsPo4J57LFV/ftK9b5AlR6N3bBVt+1QNhgOsAgU8CeT3Arb8/gKWC0WtdV8orRzbDNvFv+0iw2wcOLQwGMgO8P52BW397YK8IagWn9xBUIQROANzS59+9K9z8MrgJC+GNyd12byJIBKoX8L9/fAf/+d1XrhufYU/y7+GbtlcJEoHJAb48ex/ufPAdeA0LgBPKPe/8DIJAIAQw/+43dsxvF3c++NbuQcgsSu10lA8B3CLbaXyHexceBSIcGPbx5YriZPp+4Zf4XCSjbAjgfYGaMX50swm9+7rswk9kU94B2kUikTg2s4HEzb/cFzWDTeK9TFAN0fjVFQAXdxrp47PhX/vDVth57KdFw5fDonIKR7LvzbnAl2f/r2w+YBCRcj6MDcUxWJadx7bCb2b32gWdasZnuI+//WgMfv2vX9j3yMLfRcXtZ0QpOG0IP6CcALiFysJG3/PO9pqGL4fdOd/TyPDx/Rk1cwFOAr8GhWik9bMBW5kD0Mj9Dy4+XjO4pARE3yvXDZTdE/DVkS2uTADh95AZHWTj37uglhdAxDTnAGlQCNk9gd2c/TPw3s+lruNxCJUggoxydQCZLWG59bs5aMPvJeMFVNuxlG1vWAolgexmZbpnr/x2M7iNzHAwfzeV8gAyRC/AIDMNiiC7IfSmvi5wGz5GRoblb1o/saRdoEkZY/U5pCFgeDFmz+/JxaR6qOQBeqLRtDF30D5MSOmCdik8ccMrzE2Bmj6R4YOkCptEBccL1Jr31yo5MWYQIFL8X36PIMQvQAFkXbAXbpjf00txtRsEsG2e3yUMLOnz5v1EdsTt0SfPwG1ka/1eJKBewOMA/DMfAhCVEIBsInZvxv0DJB5eelL3GhaoMsPCBZvbAsiuRJQQACNVkBGt1c0wIDv+oNKCkt6uyAsBcE9AlYrgljfl6vI8Ru8WsqOP2zwoQHmBiP8p5yjZ0n7NFVAA2QUa3GLdmK7FU81lRx+V8QAlIf+FAOjFOTKdDMdY2T90q7OF+V6e8iWD2+MPHlNs7EUBmIY5B4rw+h/lR/pYBM3MHeSWz/fKotLSMRNe2HrN+eDDC/tvq7Jr2OejtxuahiW7xs+ZE9jIe3PrV+W4eY7/s/3XDzqP10wKtSyaQQNOggLwGP0nv/9KujjDI3WON+BZwS+LMGL25h1gbsmyl4w//PhxU8UepXYeKevyrz030IRpkQsoIQB7yxcRCm6elYvRDiwE/sfGdgOeO6jSglHh4adKH68Z3bjYd30OFBoYeu3YVnsWr1/wzOFGZg/7DXf1CzYusm54iyyYAoXgUOBH94sXlnDrVwpc39Nbf3o4hwHFOPDXnfZuHu2CP+uNqd2gGuXun8FKFw7ND15V8RQxTvC8XivILl+5lg959z/bf22daqstDZsBBU8R4WycN3lsdNmYDNyN5OVfym4ghTBe+ekK8CkikZeyfNKykhvj8FgAbxbBlbxWhSCzplAFIhjZ/WFfKl3+PFa7QYSBMfHqGVAYZ7HnnX9+Kz2h1IFbOg/ubD+6RWnDM4g4Odt37UTF16rdVPAC7g+s+wSLwV4C/tmz4h5CjnfgVs6ho0u4+d69L8G2oZ8ob/RSqrV+BmvdeOT64IQqlUFNZWq1fqamzHOrkTEI0IzhMCIGfsZrvV5TAPaUcYLzoFETgvFqrt+hbqDLPo9MqLyPUFixy74D18fqXVdXAOwFCOkEaJRCJHenZa6TSnV5AEGMEehQoAjC+Oc/6r8mVdKX7utwQqhDQefDNurpjozJXi8tgHxCaB0F3SvoYDBjonnYmfErQ0PVjtmB+ZToV0rFFo0fWHWz/nIaLneJosIkdy9A01kIm1zsn5+ABkFokiCMFQQGNr5El68STQuAGV7YP0lAx0HjGyLpmxLj/KPQJC2NeNgfrMOBf4i/fSvGZ1ryAA46HPhAC26/FFcEwAwt/PKUyEJZBPocQk/BjEXW6UsD85PgAq4JgHlrMRHPUe6yKquLVMMuxJF5dHYg5dpyfldnPXAfdPUH86AuG7sPl3d7us2Dbhq/8L7ecGRh/4hQ1zntDVqDWz0PxpUv6HDv/T1GJ4jNgqL0Tud7N0YmGintNvwp0AYKucGYrhnIkXf3kTEvDV/yWe1DC6EW7Wnx6z4VfMAWAuSSoi97Juw5Aq/XJ4KZdhu+5PP9ZWhxMImEo+LXQ+ERA2YQaIoQpr1K7qS/CXQQjhiI6ICKaxNrkZ9MQzOdYPRSOkoApZSEiaSKgmCDi4rdnGEYV1ZhdW6u70YaOpCOFUA5I7cTsaWVbALISCBYcQI4IL6+EAX5XHq2k7e0CF8pRPMLQCvFmzD6Ec+bQRkBVIOF8fTZapwMjIlWFyeL4ogQEwLZBYVxCX6ef5L9uLZgSuc92mcqImScc5X4hDU0uGVDxiAr3bMxmlbF0NX4EfFUEvPqLP33AAAAAElFTkSuQmCC';
    supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0]);

    private _connecting: boolean;
    private _wallet: OnekeyWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: OnekeyWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.$onekey?.solana) {
                    this._readyState = WalletReadyState.Installed;
                    this.emit('readyStateChange', this._readyState);
                    return true;
                }
                return false;
            });
        }
    }

    get publicKey() {
        return this._publicKey;
    }

    get connecting() {
        return this._connecting;
    }

    get readyState() {
        return this._readyState;
    }

    async autoConnect(): Promise<void> {
        // Skip autoconnect in the Loadable state
        // We can't redirect to a universal link without user input
        if (this.readyState === WalletReadyState.Installed) {
            await this.connect();
        }
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this.readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this._connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const wallet = window.$onekey?.solana!;

            if (!wallet.isConnected) {
                try {
                    await wallet.connect();
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
                }
            }

            if (!wallet.publicKey) throw new WalletAccountError();

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(wallet.publicKey.toBytes());
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            wallet.on('disconnect', this._disconnected);
            wallet.on('accountChanged', this._accountChanged);

            this._wallet = wallet;
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
        const wallet = this._wallet;
        if (wallet) {
            wallet.off('disconnect', this._disconnected);
            wallet.off('accountChanged', this._accountChanged);

            this._wallet = null;
            this._publicKey = null;

            try {
                await wallet.disconnect();
            } catch (error: any) {
                this.emit('error', new WalletDisconnectionError(error?.message, error));
            }
        }

        this.emit('disconnect');
    }

    async sendTransaction<T extends Transaction | VersionedTransaction>(
        transaction: T,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const {signers, ...sendOptions} = options;

                if (isVersionedTransaction(transaction)) {
                    signers?.length && transaction.sign(signers);
                } else {
                    transaction = (await this.prepareTransaction(transaction, connection, sendOptions)) as T;
                    signers?.length && (transaction as Transaction).partialSign(...signers);
                }

                sendOptions.preflightCommitment = sendOptions.preflightCommitment || connection.commitment;

                const {signature} = await wallet.signAndSendTransaction(transaction, sendOptions);
                return signature;
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletSendTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return (await wallet.signTransaction(transaction)) || transaction;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return (await wallet.signAllTransactions(transactions)) || transactions;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const {signature} = await wallet.signMessage(message);
                return signature;
            } catch (error: any) {
                throw new WalletSignMessageError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    private _disconnected = () => {
        const wallet = this._wallet;
        if (wallet) {
            wallet.off('disconnect', this._disconnected);
            wallet.off('accountChanged', this._accountChanged);

            this._wallet = null;
            this._publicKey = null;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };

    private _accountChanged = (newPublicKey: PublicKey) => {
        const publicKey = this._publicKey;
        if (!publicKey) return;

        try {
            newPublicKey = new PublicKey(newPublicKey.toBytes());
        } catch (error: any) {
            this.emit('error', new WalletPublicKeyError(error?.message, error));
            return;
        }

        if (publicKey.equals(newPublicKey)) return;

        this._publicKey = newPublicKey;
        this.emit('connect', newPublicKey);
    };
}
