import type { WalletName } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletDisconnectionError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type { Transaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

interface OKXWallet {
    isOKX?: boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getAccount(): Promise<string>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
}

interface OKXWindow extends Window {
    okxwallet?: {
        solana?: OKXWallet;
    };
}

declare const window: OKXWindow;

export interface OKXWalletAdapterConfig {}

export const OKXWalletName = 'OKX' as WalletName<'OKX'>;

export class OKXWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = OKXWalletName;
    url = 'https://www.okx.com/';
    icon =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAU4SURBVHgB7dnRTRxLGkDhYiMYIvCEABmQgUMwGeAM7AyACDARGEcAGUAGkAGTQS9jefdh915rhWTtVJ/vk37R4qmo6T7d9ByNMZYBJP1jAFkCAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGECAGGJAFxeXo7X19exLMs0s1/zWlxcXEy3/9+/fx/b7XYULGuetwtpmdV+7TPt9V/N+fn5MqvHx8ep9vo9c/TrYLXePscxq91uN46Pj8fM7u/vx9nZ2ZjV6enpeHp6GmvlHcAB22w2Y3azP0av4TP4HQGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAMAGAsNUHYLfbDf5/Xl5eBodr9QG4vb0ds7q+vh6zm3n/9/F6eHgYa7esfa6urpaZvL6+/lzzTHv8u/n69evy/Py8zOT+/n7ZbrdT7fM7Z6rFJufi4mKqC+jx8XG5vLycao/DM9Vic3N+fr7M6ubmZqq9Ls7RrwMO1NvddJycnIxZHR8fexF7wHwNeOA2m82Y2czxKhAACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMA/qjdbjc4XAJw4G5vb8esXl5extPT0+CwLeaw5+rqapnN/f39st1up9rn4hz9Oli18/Pz8enTp/F2Qo4Z7O+c+zv/t2/f/v27zWbzc2ax/xv+5eTkZHz58uXnzxns1353dzeur69HwTS1es+8nXjLrD5//jzVXv/V7J8CZnVzczPVXr9nVv8E8Pz8PM2d/z/tX6AdHx+Pme3vpB8/fhyzOj09XfV7jNW/BJz14t+b6ZH/73z48GHMbA2fwe/4FoA/au0X0OwEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEAMIEgD9qt9sNDtfqA/Dw8DBmdXd3N2b348ePMauXl5epz5//1bLm2W63y/Pz8zKbp6enn2ufaa//bq6urpbZvL6+LicnJ1Pt83vm6NfB6p2dnY1Z7B+b3wIw1uTtYhqbzWbMYL//+7t/4d+XTACA/+YlIIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIQJAIT9E9kyaBHlxZP4AAAAAElFTkSuQmCC';
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: OKXWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: OKXWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.okxwallet?.solana?.isOKX) {
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

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this._connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const wallet = window.okxwallet!.solana!;

            let account: string;
            try {
                account = await wallet.getAccount();
            } catch (error: any) {
                throw new WalletAccountError(error?.message, error);
            }

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(account);
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

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

    async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
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

    async signAllTransactions<T extends Transaction>(transactions: T[]): Promise<T[]> {
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
}
