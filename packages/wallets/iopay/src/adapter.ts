import type { EventEmitter, SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
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
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type {
    Connection,
    SendOptions,
    Transaction,
    VersionedTransaction,
    TransactionSignature,
    TransactionVersion,
} from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

interface IoPayWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface IoPayWallet extends EventEmitter<IoPayWalletEvents> {
    isIoPayWallet?: boolean;
    publicKey?: PublicKey;
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

interface IoPayWindow extends Window {
    iopaySolana?: IoPayWallet;
}

declare const window: IoPayWindow;

export interface IoPayWalletAdapterConfig {}

export const IoPayWalletName = 'ioPay Wallet' as WalletName<'ioPay Wallet'>;

export class IoPayWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = IoPayWalletName;
    url = 'https://iopay.me/';
    icon =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIwAAACMCAMAAACZHrEMAAAC9FBMVEUAAAD///////////////////////////////////////////////////////////////////////82NkcpKTaEX/92av96Zv90a/+BYf9+Y/9ucP94aP9mdv9wbv9odP9rcv9xbv9ybP+AYv9zbP9pc/93aP9scf98Zf9jeP9ub/99ZP9RwNZief9ld/9Zn+pVsOBTt9xZnOtQxdRhev97Zv9Ozs5N08tM2MlQx9Pm5uhXp+VTutpPytFK4cNWreJRw9VdjPVJ58Btcf9Pzc9ehflcj/Nblu9VruFUs95WqeNL28ZdiPdSvNhJ5cJfgfteh/hblPBXpeZUst9Us93NzdA0NDlfg/ry8vRckfJamuxYoehK38RH8rpYpOdPT15gf/xame1I6b5gff1PydJH7rxbkvFamO5TudtSvthH8LtG9biBgYxge/5Wq+NUtd1PzNBM2seampxoaHVYouhXqeRO0c1F+bZDQ1JSu9l7Zf+Ojphldv5di/ZcjvRN08xG97dE/rJRv9dO0M5M1spE+7RM2chL3cZK48NI7L20tLpJ6b+np65N1cuzs7Ta2t1L3sVRR4xbW2k+PF5NTVHZ2dpTvNlI676amqNIQXU6Q1uAXPRjauY4PFEvNU1BQUVuafTAwMV1dYE3TlU6OVJdYM5lUbpQVqumpqhEcZZJRYE7gHA7amg5WF1ieP9aeeddb+ZsU8hbWLpfT65IUJpYSJhBRXU+Rm1nZ2pEP2o8YWhicvN7WehZfeFyWtzAwMZJgqhEmZlHYpk/ZIxGUIo3QU5XquRXhdxRwtZeZNROtMdSbcdLiblF6LJMaK9D8qxJeKtC5aVcS6NAzJg/qIxAg4WAgIQ9iXk9V2w0R2I0OFstLkNUotlQdbxJpK9D4KhHjaFDjJI/wJCMjJA/bno7U3o7VXk8dm84O2g2NkJZj+VYjOTZ2dlSq9RUldNRhslMysJNk8JF87VF1q1GxalEzKVDz6NCsJlAro2Cgow9mn0zNU/HbpPgAAAAEnRSTlMA3+8ggM+gkHBgQBCvv49QsE+daNf+AAALlElEQVR42tWcVbjTQBCFgeLODu7u7hR3dwrF3S/uFHd3d3d3d3d3d3fnhZXsnYQ0QJNCy3np6//NnLMzm69JECPZwoQKHyIo8bKChggfPJItiEcKG0qD4XWkkGH/lCRc8GDkrytoGJu/oDAFi/hbnND/AAWr80sUWwTyTxXU5h9lUXoV2oglIvGBgrtnCUl8opDuWEIQHymE39TFbW2CEx8q4k85Ij6VJlO2YMSnCqY+b4ISHysCsoQhPldgo2w+LwxtVLjAk9cPFNw/3CtL4y+O4aXxjygppeH7LvEThf0HQ8k5caKT/IlC/fUuObZUpRo3ivxeQWmWyN9U+6rtHYRMXDJhwkTyW9mCRCJ/Ue1nOwKpfl+cMH9ld0AWrMeSqpzLWMw04clfELKg7k/4nY8j/6VtE1lQE9qTXyuEpTDZdw+b4gqgck0Z4RhtwIKNmkB+JRYnYk5Oh6tDV9Cqg2u3U8+C6FV/1ydTMM5hAmTB1rHn1i+iWn9u7NStAmiYXbBMYL9aVZ3ofRiHi5Fs3bh2erRosWIlSRI7dpo0KVNmizFn4fqpQDVvN7JoYRzehnF0AICp6ykIReEsFCZltmwx4saNmzz6nHXLAKDuJXcsL7zdptEUZcHGXRQEWdJwlhhxkyePHj1mzKQz1o1/iiwqXdpCvAnjdFGUc7QokkWUJSVDkSxJEyda5pZlVFW7N2EcdQE2ShSsS3dkYSiJxhqwtCdehHFRr7AGCQXaRWGJzupCWeKvm/07FuswduqW9YjCWJIgS1zJkij++Pa/YbEOY68L49cGsqB1u8cQMVJ6FD/+HDxN1CyjiPdgRneFrTv0LNS6GKPEjCX1wqoGLNZhkGUsc64+RsIvyBJnRlWnAYtlGGSJpmZBu8SQMRIsqePMgZ/P2SXIYgUG/TIWUTBGWJaYiZMmSpSI1iVOihRb7+s2T+IFGGRZpisLRhrrQlkKp0i4UEQbWZ52HeY9mHkw3uCkk3VJKlBoXRImTJhs8xYNy2YAmOItmCkwfodBpJPLurAWpaZloSjJEsyYeUnFcqroJgAI8A6MHWCt3rpYFx1LgngzZk6wI0uFnTORxiJMXdiILAIFp5E8dbl1JUuPeGsOVN2yxDF3yRY4XrRCmYI3AWkswYyQhsEJgKeLZGF2KcxRKEu89Ol7pFpzYPPMmZv3rWYsvYodACqXeRhM0iJtpFPyHuFJlzg+1oWzxOuRPlWqdOmyNqxXvlrRCj0LFqve5BlrFIywChMAY3+yi7K9oHUxRoKF1oWitGIsFcpwlopN9wGTwyQMuneH4amLPSqMdklPy7JKsBQVLBWLN62feRpQ1bWydmJhhF200ygpn9KCJQVlEWWhMOmyUhbaImYXzlIjc4YzwOSyAmPvCjvQumkEC1qXsmCkOQtDYT2qJ1maVCxen7LUrDMTG2USZhhMVVnXaAJorctapGeptFTcqizAjINFOpbkOBlZXaR143EWZl0RozJlmHUFS8c6uTvdAK5hpmHsMB6t+1OkqXXRLjNmbKckzLpZ07VSRZpZV7CUyn8FuIdNw4yAseppJGMUXbDwshROuPDAtahU1zctTo+RxhhlqMlYWufPuAe4HGZhOsBa3LtFjDiKyrpHn0QN1KzFjKV8eWkXGiPGUil3qdYlMlZ+CegaEzBOgOmBPeIoskfSLikWR9Xo2hp1pOurWEpWyXQFS2MCxgFTje5GtEfMLhsUCCzO6p9jRFnyc5ZmIk8wxRzMFNgoWNxOAGTR0nDrIkunQ4Ilz6RbgBb2AAYto77WY13ix4/DIj0DGVCb1TGqxGKUsXLJNpnylG1+DIRGm4IZB7vk4w48XkRdCrMp/T2qOx1XxUiwVKEsk5qnLTANuEaYggHAaYSPGFhZCrPjZV1Ut7paXR0jykLtkqcsZcmyDbjmeQSDR15s3TTCxTvZsqju9ZzbJUMd2qPWwrrdyvZLWyBXowfA1dUjGAwTslAUWRe5MVw3gDklrVtKsS5jyZKlUd6LIGQ3B6NlSYyLN7sDRDXQfoy0iFHZfkey5GrUtshdEJprAmYuLFP3KDFlUS+YC41gHopphNbtV4CzZN8L6GBPYYbBWM6C1uVlkVPaEOZRzZqVJIti3Vx52xbp31nCuMzBYIywRWKpS9BjjSGMMhkrC+tyliLZ+/fOIWHmmYJZJqYRxki91G03glkqpxGLtGBpm71/jpEDJMw4cwbGuig9Ut0B0j8xgDnBrVuZxygtizStS+ccI3MOkmmqawJmNIxXHy/inibr0iNVqg3uWWapIp2Wx0iwtCttBcYOC/A+wkYAvzMKFrbrbnd/0JyhLJVL8hgpLcreO8cAyjJmhQUY0hXmSBaMtLgc8aVug9vCCOtmwhgpLLXybQNFJgelamOQLHzvFgvmNXeOYVNaRroRsy5nGVwr35CDVmACYJ3qnsZ7RFHwzlh+9Sz98VtCH+mcg0pTlnIfwFSbcB9XNgaje9rOn2mWKtbFGPUeqbAU+mwJxgHjlRipWkRjxHok72n7NNvDW2ZdWpfm/dKyGEmWMYxl+GUwd86ggxPxSAsWGaOsWVWPOw4/nCVRqF0yshh1a56WsvC6iBjloywNJq+UMB1MwcyDxfHRLqws0i74uIMuUq/P7N+/dM8NGiOMtCZGQyjL0PcgNc/kJW6Tyi7iqBP3NNainoGPGPiyy1kw0uoYFaIsjS+A1BRTME7aJ4UFe0Stiyz6BVPGqEhnFiPKwuzSYGiL2rRL5lYIvB8sVp0ukqW8wd0IF0wW6Rws0sjyCQLlMAfjgAWChSUaHzEYsHDrFuDWFdNIsjRuUbvlcoRxmoMhdeGoZKGRlizcuhoWEWkRI2QZw607mbHcBsBkewqDFhYsGCPKgvc0yiLvac1wMspII0sfVWECPIZBCx9VJkA61VNDvXXVLP01keYstwE113MYfCa9Pd5P1i2IjzvE3UjGCKcRxqhxbcrSZTmg7J7D4OheTFn0TzClXZCF2iWXmxi1bNmly1lAdSAmYDBQa3iMWikToJfauvwRQxsxGbNkEdbNwexCWaRdunQZOB9QwyzAEBdsSofW5SxN5VNDGiM5jcTdSGfdd326DOz7DVRyWoFx1oUNuhhl4CytlQWzrDxe+guWWhgjxnIeQJ0lUzDYKDiusNCTjrPIGJVgd0ZuXYxRaYyRYDmrbhLYTcJgohasRusKFrQuLpjqaYQsp+drC2MRhnyF8Tv1MdJPI1ykGjSWLH0fg1p28zCY72k7tTEqhTEqwGKkXeq4XVr2GUhZloO2MNZhnJTmMI+RYNHGCO+MIkbDA637M0tdu0UYpKEsmQMjLaZRWW5djLTGutQvuMTgGWMBBmlm3qyhiXSznxfMwT/FCHOETbIIg4cf7MMFk7FgpKldBIs6Rn3vHQRtk5xWYVBTAKa9ohNAibR+qcPJ2IVF+jJo1dVOLMOgRtcFWIqRTntETiN5T5PWZSz3sEX4MNo6DMoeQIuzR4kRm9LIUiufhuX8CkCheb0Dg8VhOPJu1MggRohiwGINBjWM4dw5FvjUUBejkxfcoHQdTbwNgzhw5c4xzWQsJFhOflmOEdIddl6Fwf8xMs1/cPfWG4zRyY8XLq8Et3I5yZ8J/5zsYXGEDq7ctm3F4xXbVmJ4dC3aTf5QQc39bds5BfQyWRZUCI//0I4x/xMFoFt+r8hBQhEPhTiyWYYNmuIknii4pReK5gZ0NSYJcBAPFcXq6yH4v3Y1SAeXw0k8ls0bL86MnjvCFdCBa16Aa8RcOzEh/uIMNY2fKKS/vWwVxC/ez6Nd8v07wKgwHCacX5QmmM0PXo8W4m/E+U1pgtr85G1tdAxXBOJjBfXXl8eD+NNr9T4eCsH9+VMM/vWRCv/6fIePTuJQ/8MnX/79dxAi/PpLQWEs41gvC8oW6l99QCl4OGMKxDFRHe+joMKG/Ks8QUOFDeKRbJGC/53PkYUy/tzWD9OCVpozSm6xAAAAAElFTkSuQmCC';
    supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0]);

    private _connecting: boolean;
    private _wallet: IoPayWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: IoPayWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.iopaySolana?.isIoPayWallet) {
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

    get connected() {
        return !!this._wallet?.isConnected;
    }

    get readyState() {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this._connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const wallet = window.iopaySolana!;

            try {
                await wallet.connect();
            } catch (error: any) {
                throw new WalletConnectionError(error?.message, error);
            }

            if (!wallet.publicKey) throw new WalletAccountError();

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(wallet.publicKey.toBytes());
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            wallet.on('disconnect', this._disconnected);

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
                const { signers, ...sendOptions } = options;

                if (isVersionedTransaction(transaction)) {
                    signers?.length && transaction.sign(signers);
                } else {
                    transaction = (await this.prepareTransaction(transaction, connection, sendOptions)) as T;
                    signers?.length && (transaction as Transaction).partialSign(...signers);
                }

                sendOptions.preflightCommitment = sendOptions.preflightCommitment || connection.commitment;

                const { signature } = await wallet.signAndSendTransaction(transaction, sendOptions);
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
                return ((await wallet.signTransaction(transaction)) as T) || transaction;
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
                return ((await wallet.signAllTransactions(transactions)) as T[]) || transactions;
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
                const { signature } = await wallet.signMessage(message);
                return signature;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
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

            this._wallet = null;
            this._publicKey = null;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };
}
