import type { EventEmitter, SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
import {
  BaseMessageSignerWalletAdapter,
  isIosAndRedirectable,
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
} from "@solana/wallet-adapter-base";
import type {
  Connection,
  SendOptions,
  Transaction,
  TransactionSignature,
  TransactionVersion,
  VersionedTransaction,
} from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

// Replaced external import with a constant for the package
const NEXT_PUBLIC_APP_URL = "https://dexspace.io"; // TODO: Update with actual URL

interface DexspaceWalletEvents {
  connect(...args: unknown[]): unknown;
  disconnect(...args: unknown[]): unknown;
  accountChanged(newPublicKey: PublicKey): unknown;
}

interface DexspaceWallet extends EventEmitter<DexspaceWalletEvents> {
  isDexspace?: boolean;
  publicKey?: { toBytes(): Uint8Array };
  isConnected: boolean;
  signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): Promise<T[]>;
  signAndSendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    options?: SendOptions
  ): Promise<{ signature: TransactionSignature }>;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

interface DexspaceWindow extends Window {
  dexspace?: {
    solana?: DexspaceWallet;
  };
  solana?: DexspaceWallet;
}

declare const window: DexspaceWindow;

export interface DexspaceWalletAdapterConfig {}

export const DexspaceWalletName = "Dexspace" as WalletName<"Dexspace">;

export class DexspaceWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = DexspaceWalletName;
  url = NEXT_PUBLIC_APP_URL;
  icon =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSczOCcgaGVpZ2h0PSczOSc+PGltYWdlIGhyZWY9J2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQ1lBQUFBbkNBWUFBQUJqWVRvTEFBQUFDWEJJV1hNQUFBc1RBQUFMRXdFQW1wd1lBQUFBQVhOU1IwSUFyczRjNlFBQUFBUm5RVTFCQUFDeGp3djhZUVVBQUFRalNVUkJWSGdCelZpeGJoTkJFSDE3ZHlhcGtQa0N6QmRBZm9DNG9RQ2FRQkVKVWRnUkZFZ0lKVUVLSWtoZ0J3b0tKT3lJQXFnU2hKQW9rT0kwVU1hcEtBay9RUHdKb1VGUTJNdWIzVDBuUlBIZDdrV3hlRkprU3pmbmUvZG01czFzZ0J6Y2dhNHNRSmN4WmtTNUFSRWF2NEVGakJrcTZ5S1ZxdlFWZm1qZ1o2SXgxWWJxWVV6SVZDeFdXRXRJbmtGbEVsekRHREdTMkNQb2VxeFJqZms5c1lIVFZMQ0tNV0VrTVpLWlQ1aG9FdFB1VDlJK050V2lqQXVicVZxU3pzU1NxOXlITHRRSU02elhxMHB2WFlHKzRCT2ZWV050RXVsSlFNVHFaMXBWckV6ZFBXa1dzUTkydDd6WVo2Z2R2L0FSYUVMdGtjeWlxRlZTUnEyMDFzNzg0a01RZ05sWXo4UUQxTm5acTc3M1pIYmxZNmdPQ1hValNhV1EwNmJtb0RUbUh3WTBRdHhIUytyMUZORHh2U2ZYWUVsbVJjakVsdHl3NXZqVlM3VTZ0RFJSaGIvVCtSamdnN25FbHFHNnJMSFZTTHNPNVdmSk5rSjFHWG9tNjE0Wlo1SEN2SHV4VFFRZ2w1aGdraVhIT3BPYU15bVYxRW9qOEhzcnB4RWFyS3R6MGtUdm9kWVJBQzlpaTJ3RUpTbFY1Z2JsR2tIVXF3em9kMGZkSStPTThUV1RmbzB1QXVGRlRMQUUxU2FaSFQ3RWRtZHFIK1JBMVNxSDQzbHBnN0V5enVUN0NnTGhUY3c4VE94RFVxbE5Ha1VKOGJWeWZHaU9MbkdjOGZyNVZLMDNCWVovRURHbXRFdUZ0a1d4MURyYzUvU3pBL2JCNW1oSVBjb0w4QUh2VUFCQnhBUjlqVGtxc1dkOFRRMU5WK3JPMU5vS2RFUHN3ZGdLNDA0SGVOZXhpRkcxSGkxQXhwVnBBbE5udHU0Mm4wdkJzNE5UTlpuR2prd1FGRUF3TVVGcE1CencycEhxUEtBZHhCeFZvcVN6RkNGWEtJMkZpVW5hbkNwbUdoQ0xMZGFZekVNejdPMDJnbEtFYVJSRUlXSk1aZFUwQUV3YTF5VzlpUlM4S09WMk9GRk5EWXlWRkRySUJCUDdRQ3RnMTUwMUtkUG9UZXg3MUVxcWxNeFN0eWFWT1RWYUtJQmdZdUxtc1QwSFNNcWFjODZqN3RGS3hMTWt4VzZ1bXBsS0Jlc3ZDcXprUWNRMjJIVlVvMnBTQmV6V29QNHBibzZueGRSQ2hnMUFrclQrb1AwdG1CaUQ2K2tLeEFkZVAzejlMcmRURWx0TjF5TXo5RzE4OVdXc2F3aEFFREUrcE9Zc1luMTJ4SXBNS3hFZjI0dnNKakwwT2RWSHV4WFFDTjdFdnJCT1NFb1dQaldSTVpUblpCUGg5Y1J1SXRabzdZcFVqa1pzSXNjaU5obWhKc0VzNk9ibG5LRjhpNXNJWDZCYnd2NDZMbjlzaElYWFIyd2loWWw5bFZHaklSdkQ3aVVvcnhWR1cvdkF3Yk1DUDcxUDlINkt4Y1pRNVFGUDRZazV1NUp2cHRNaDFvNGtHK0dWaDMxNEVlTXBwOEhBN1l1QjYzRWk5Z0hUQ0drVEtPZHZ1YXJsRXZ2R2s3UDgyQVRYSFFUaUJtdXhwTkUydm1iSjJiUnlMWG9iWlovb0ZVNFlOT1h5SDc3ZlFPRXNkem1sU2E0UHM5ZDl2dzAxTmVxK1FrTThCTmRvSHk2bHl2MlRKbDBzTTAvbEo2NVlpay9RVzFSdFdsVGo2T3JkaERxWEZYL2lpcVdJUlRVM29rb2k1UDhFMWx0N0k5SmVQcFpndkdoT0R1QTFMLzhDMm1jdWt4NnRHS0VBQUFBQVNVVk9SSzVDWUlJPScgd2lkdGg9JzM4JyBoZWlnaHQ9JzM5Jy8+PC9zdmc+";
  supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set([
    "legacy",
    0,
  ]);

  private _connecting: boolean;
  private _wallet: DexspaceWallet | null;
  private _publicKey: PublicKey | null;
  private _readyState: WalletReadyState =
    typeof window === "undefined" || typeof document === "undefined"
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  constructor(config: DexspaceWalletAdapterConfig = {}) {
    super();
    this._connecting = false;
    this._wallet = null;
    this._publicKey = null;

    if (this._readyState !== WalletReadyState.Unsupported) {
      if (isIosAndRedirectable()) {
        // when in iOS (not webview), set Dexspace as loadable instead of checking for install
        this._readyState = WalletReadyState.Loadable;
        this.emit("readyStateChange", this._readyState);
      } else {
        scopePollingDetectionStrategy(() => {
          if (
            window.dexspace?.solana?.isDexspace ||
            window.solana?.isDexspace
          ) {
            this._readyState = WalletReadyState.Installed;
            this.emit("readyStateChange", this._readyState);
            return true;
          }
          return false;
        });
      }
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

      if (this.readyState === WalletReadyState.Loadable) {
        const currentUrl = encodeURIComponent(window.location.href);
        window.location.href = `dexspacemobile://dapp?ref=${currentUrl}`;
        return;
      }

      if (this.readyState !== WalletReadyState.Installed)
        throw new WalletNotReadyError();

      this._connecting = true;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const wallet = window.dexspace?.solana || window.solana!;

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

      wallet.on("disconnect", this._disconnected);
      wallet.on("accountChanged", this._accountChanged);

      this._wallet = wallet;
      this._publicKey = publicKey;

      this.emit("connect", publicKey);
    } catch (error: any) {
      this.emit("error", error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    const wallet = this._wallet;
    if (wallet) {
      wallet.off("disconnect", this._disconnected);
      wallet.off("accountChanged", this._accountChanged);

      this._wallet = null;
      this._publicKey = null;

      try {
        await wallet.disconnect();
      } catch (error: any) {
        this.emit("error", new WalletDisconnectionError(error?.message, error));
      }
    }

    this.emit("disconnect");
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
          transaction = (await this.prepareTransaction(
            transaction,
            connection,
            sendOptions
          )) as T;
          signers?.length &&
            (transaction as Transaction).partialSign(...signers);
        }

        sendOptions.preflightCommitment =
          sendOptions.preflightCommitment || connection.commitment;

        const { signature } = await wallet.signAndSendTransaction(
          transaction,
          sendOptions
        );
        return signature;
      } catch (error: any) {
        if (error instanceof WalletError) throw error;
        throw new WalletSendTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit("error", error);
      throw error;
    }
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        return (await wallet.signTransaction(transaction)) || transaction;
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit("error", error);
      throw error;
    }
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): Promise<T[]> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        return (await wallet.signAllTransactions(transactions)) || transactions;
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit("error", error);
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
        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error: any) {
      this.emit("error", error);
      throw error;
    }
  }

  private _disconnected = () => {
    const wallet = this._wallet;
    if (wallet) {
      wallet.off("disconnect", this._disconnected);
      wallet.off("accountChanged", this._accountChanged);

      this._wallet = null;
      this._publicKey = null;

      this.emit("error", new WalletDisconnectedError());
      this.emit("disconnect");
    }
  };

  private _accountChanged = (newPublicKey: PublicKey) => {
    const publicKey = this._publicKey;
    if (!publicKey) return;

    try {
      newPublicKey = new PublicKey(newPublicKey.toBytes());
    } catch (error: any) {
      this.emit("error", new WalletPublicKeyError(error?.message, error));
      return;
    }

    if (publicKey.equals(newPublicKey)) return;

    this._publicKey = newPublicKey;
    this.emit("connect", newPublicKey);
  };
}
