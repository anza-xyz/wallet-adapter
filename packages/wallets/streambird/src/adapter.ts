import {
    BaseMessageSignerWalletAdapter,
    WalletConfigError,
    WalletConnectionError,
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
import { default as Streambird, StreambirdParams } from '@streambird/solana-embed-sdk';

interface StreambirdWindow extends Window {
  streambird?: Streambird | null;
}

declare const window: StreambirdWindow;

export interface StreambirdWalletAdapterConfig {
  params?: StreambirdParams
}

export const StreambirdWalletName = 'Streambird' as WalletName;

export class StreambirdWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = StreambirdWalletName;
  url = 'https://auth-staging.streambird.io/wallets/solana';
  icon = 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMjcuOTEgMjM3LjgiPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDojNjFlODkyO308L3N0eWxlPjwvZGVmcz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0yOTUuMzQsMjEyLjU5YzIwLDAsMzUuMjYsNC4xMSw0OS4zNCwxMS4zNGExMDIuOCwxMDIuOCwwLDAsMSwzNywzMi4zMmMzLjEsNC4zNCw1LjMzLDkuMzUsNy42MywxNC4yMSwxLjMyLDIuOCwzLjEyLDMuNjMsNiwzLDcuMzQtMS43MSwxNC43LTMuMzYsMjItNS4xLDQuMDktMSw4LjIyLS41NCwxMCwzLjMsMS42NSwzLjQ2LjU2LDYuOTMtMi41OSwxMC4yNi04LjM2LDguODYtMTYuMTMsMTguMjctMjMuOTEsMjcuNjYtLjc5Ljk1LS42NiwzLjc5LjE4LDQuNzgsOC4yOCw5LjgxLDE2Ljk1LDE5LjI4LDI1LjExLDI5LjE2YTExLjA5LDExLjA5LDAsMCwxLDIsNy44N2MtLjU1LDMuNzctMy43OSw1LjMyLTcuNTQsNC42NS03Ljc2LTEuMzgtMTUuNDktMi45MS0yMy4yLTQuNS0zLjg0LS43OS02LjE4LTEuMzctOC42MywzLjc1YTk2LjI5LDk2LjI5LDAsMCwxLTQ0LjYzLDQ1LjYxYy05LjU0LDQuNzgtMTkuNiw3LjMyLTI5Ljk0LDkuMzRhNy4yMSw3LjIxLDAsMCwwLTQuNDUsM0MzMDQuMTMsNDIzLDI5OC44LDQzMywyOTMuMzksNDQzYy0yLjUsNC42LTYuNjMsNy40Mi0xMS41Nyw3LjQyYTEzLjYxLDEzLjYxLDAsMCwxLTEyLTYuNDNjLTkuODUtMTUtMjAuMzMtMjkuNTEtMzAuMi00NC40Ni0xMC41Ni0xNi0yMi45My0zMC44OS0zMC42Mi00OC42OC02LjUxLTE1LjA3LTEwLjI2LTMxLTgtNDcuMjMsMi40Ny0xOC4wNiw4LjA4LTM1LjE0LDE5LjQ4LTUwLjI2LDEyLTE1Ljk0LDI2LjkzLTI3LjUsNDUuNDYtMzMuOTFDMjc2Ljc5LDIxNS42NCwyODYuODcsMjE0LjI0LDI5NS4zNCwyMTIuNTlaTTI3OS43Niw0MDkuODhjMS40Ni0yLjI3LDIuNjEtMy44NCwzLjU0LTUuNTIsMi41MS00LjU2LDQuNDUtOS41LDcuNDktMTMuNjUsMy4zNy00LjU5LDguMjQtNS44NSwxNC4zLTYuNjJhOTUuNjgsOTUuNjgsMCwwLDAsMjguNDktOC40NmMxNC42My02LjksMjQuOTUtMTksMzEuNzktMzMuNDUsNC41Mi05LjU3LDYtMjAsNi4xLTMwLjgxYTY2LjE0LDY2LjE0LDAsMCwwLTEwLjM0LTM2LjY5Yy0xMC42My0xNi44Mi0yNS43OS0yNy44NS00NS40OC0zMi41My0xOS4wNy00LjUzLTM3LTEuMS01My4yMiw4LjczLTE2LjQ4LDEwLTI3LjIzLDI1LTMyLjIzLDQzLjgzLTQuNzEsMTcuNzctMi41NywzNC43OCw2LjY1LDUwLjUsNy4zOSwxMi42LDE1Ljc4LDI0LjYxLDIzLjg2LDM2Ljc5QzI2Ni43OSwzOTEuMTUsMjczLjEsNDAwLjE1LDI3OS43Niw0MDkuODhaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjAwLjMgLTIxMi41OSkiLz48Y2lyY2xlIGNsYXNzPSJjbHMtMSIgY3g9Ijk5LjM0IiBjeT0iOTguMjkiIHI9IjI2LjYyIi8+PC9zdmc+';

  private _params: StreambirdParams;
  private _connecting: boolean;
  private _wallet: Streambird | null;
  private _publicKey: PublicKey | null;
  private _readyState: WalletReadyState = typeof window === 'undefined' ? WalletReadyState.Unsupported : WalletReadyState.Loadable;
  
  constructor({ params = {} }: StreambirdWalletAdapterConfig = {}) {
    super();
    this._connecting = false;
    this._publicKey = null;
    this._wallet = null;
    this._params = params;
  }

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get connected(): boolean {
    return !!this._wallet?.isLoggedIn;
  }

  get readyState(): WalletReadyState {
    return this._readyState;
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      if (this._readyState !== WalletReadyState.Loadable) throw new WalletNotReadyError();

      this._connecting = true;

      let StreambirdClass: typeof Streambird;

      try {
        ({ default: StreambirdClass } = await import('@streambird/solana-embed-sdk'));
      } catch (error: any) {
        throw new WalletLoadError(error?.message, error);
      }

      let wallet: Streambird;

      try {
        wallet = window.streambird || new StreambirdClass();
      } catch (error: any) {
        throw new WalletConfigError(error?.message, error);
      }

      if (!wallet.isInitialized) {
        try {
          await wallet.init(this._params);
        } catch (error: any) {
          throw new WalletConnectionError(error?.message, error);
        }
      }

      let base58PublicKey: string = '';

      try {
        base58PublicKey = await wallet.login();
      } catch (error: any) {
        throw new WalletConnectionError(error?.message, error);
      }

      let existingPublicKey: PublicKey | null = null;

      try {
        existingPublicKey = new PublicKey(base58PublicKey);
      } catch (error: any) {
        throw new WalletPublicKeyError(error?.message, error);
      }

      this._wallet = wallet;
      this._publicKey = existingPublicKey;
      
      this.emit('connect', existingPublicKey);
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
        if(wallet.isLoggedIn) {
          await wallet.cleanUp();
        }
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error));
      }
    }

    this.emit('disconnect');
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
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

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
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
        return await wallet.signMessage(message);
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }
}