import type {
  Config,
  ParticleNetwork,
  SolanaWallet
} from "@particle-network/solana-wallet";
import { WalletName } from "@solana/wallet-adapter-base";
import {
  BaseMessageSignerWalletAdapter,
  WalletAccountError,
  WalletConfigError,
  WalletDisconnectionError,
  WalletLoadError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletPublicKeyError,
  WalletReadyState,
  WalletSignMessageError,
  WalletSignTransactionError,
} from "@solana/wallet-adapter-base";
import type { Transaction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

import { Auth } from '@particle-network/auth'; 

interface PreferredAuthTypeObject {
  type:
    | "email"
    | "phone"
    | "google"
    | "apple"
    | "twitter"
    | "facebook"
    | "microsoft"
    | "linkedin"
    | "github"
    | "twitch"
    | "discord";
  setAsDisplay: boolean;
}

interface NestedConfig {
  chainId?: number;
  chainName?: string;
  projectId?: string;
  clientKey?: string;
  appId?: string;
}


export interface ParticleAdapterConfig {
  config?: NestedConfig;
  preferredAuthType?: string | PreferredAuthTypeObject;
}

export const ParticleName = "Particle" as WalletName<"Particle">;

export class ParticleAdapter extends BaseMessageSignerWalletAdapter {
  name = ParticleName;
  url = "https://particle.network";
  icon = "";
  readonly supportedTransactionVersions = null;

  private _connecting: boolean;
  private _wallet: SolanaWallet | null;
  private _publicKey: PublicKey | null;
  private _config: ParticleAdapterConfig;
  private _readyState: WalletReadyState =
    typeof window === "undefined"
      ? WalletReadyState.Unsupported
      : WalletReadyState.Loadable;

  private _particleNetwork: ParticleNetwork | null = null;

  constructor(config: ParticleAdapterConfig = {}) {
    super();
    this._connecting = false;
    this._publicKey = null;
    this._wallet = null;

    const nestedConfig: NestedConfig = config.config || {};

    const chainId =
      nestedConfig.chainId !== undefined ? nestedConfig.chainId : 101;
    const chainName =
      nestedConfig.chainName !== undefined ? nestedConfig.chainName : "solana";

    this._config = {
      ...config,
      config: {
        ...nestedConfig,
        chainId,
        chainName,
        projectId: nestedConfig.projectId,
        clientKey: nestedConfig.clientKey,
        appId: nestedConfig.appId,
      },
    };

    if (config.preferredAuthType) {
      if (typeof config.preferredAuthType === 'object' && 'type' in config.preferredAuthType) {
        const preferredAuthType = config.preferredAuthType as PreferredAuthTypeObject;
        if (preferredAuthType.setAsDisplay && preferredAuthType.type) {
          (async () => {
            try {
              this.icon = await import(
                `./${preferredAuthType.type}.ts`
              ).then((module) => module.default);
              console.log(this.icon);
            } catch (error) {
              console.error(`Could not import icon: ${error}`);
            }
          })();
          this.name = (preferredAuthType.type.charAt(0).toUpperCase() +
            preferredAuthType.type.slice(1)) as WalletName<any>;
        }
      }
    }
  }

  public get auth(): Auth {
    if (!this._particleNetwork) {
      throw new Error("ParticleNetwork is not initialized.");
    }
    return this._particleNetwork.auth;
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
      if (this._readyState !== WalletReadyState.Loadable)
        throw new WalletNotReadyError();

      this._connecting = true;

      let ParticleClass: typeof ParticleNetwork;
      let WalletClass: typeof SolanaWallet;

      try {
        ({ ParticleNetwork: ParticleClass, SolanaWallet: WalletClass } =
          await import("@particle-network/solana-wallet"));
      } catch (error: any) {
        throw new WalletLoadError(error?.message, error);
      }

      let particleNetwork: ParticleNetwork;

      const authOptions: any = {};
      if (this._config.preferredAuthType) {
        authOptions.preferredAuthType =
          typeof this._config.preferredAuthType === "string"
            ? this._config.preferredAuthType
            : this._config.preferredAuthType.type;
      }

      try {
        particleNetwork = new ParticleClass(this._config?.config as Config);
        if (!particleNetwork.auth.isLogin()) {
          await particleNetwork.auth.login(authOptions);
        }
      } catch (error: any) {
        throw new WalletConfigError(error?.message, error);
      }

      this._particleNetwork = particleNetwork;

      let wallet: SolanaWallet;
      try {
        wallet = new WalletClass(particleNetwork.auth);
      } catch (error: any) {
        throw new WalletConfigError(error?.message, error);
      }

      const account = wallet.publicKey;
      if (!account) throw new WalletAccountError();

      let publicKey: PublicKey;
      try {
        publicKey = new PublicKey(account.toBytes());
      } catch (error: any) {
        throw new WalletPublicKeyError(error?.message, error);
      }

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

  async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        return (
          ((await wallet.signTransaction(transaction)) as T) || transaction
        );
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit("error", error);
      throw error;
    }
  }

  async signAllTransactions<T extends Transaction>(
    transactions: T[],
  ): Promise<T[]> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        return (
          ((await wallet.signAllTransactions(transactions)) as T[]) ||
          transactions
        );
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
        return await wallet.signMessage(message);
      } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error: any) {
      this.emit("error", error);
      throw error;
    }
  }
}
