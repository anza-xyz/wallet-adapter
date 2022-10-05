import { BaseMessageSignerWalletAdapter, scopePollingDetectionStrategy, WalletNotReadyError, WalletReadyState } from "@solana/wallet-adapter-base";
import type { WalletName } from "@solana/wallet-adapter-base";
import type { PublicKey, Transaction, TransactionVersion, VersionedTransaction } from "@solana/web3.js";
import type { FileAttachment } from "@secux/protocol-device/lib/interface";
import { WalletInterface } from "./interface";
import { InstallableWallet } from "./installablewallet";
import { LoadableWallet } from "./loadablewallet";


export const SecuxWalletName = "SecuX" as WalletName<"SecuX">;

export class SecuxWalletAdapter extends BaseMessageSignerWalletAdapter {
    name: WalletName<string> = SecuxWalletName;
    url: string = "https://secuxtech.com";
    icon: string = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTE3IiBoZWlnaHQ9IjEyMSIgdmlld0JveD0iMCAwIDExNyAxMjEiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMTciIGhlaWdodD0iMTIxIiByeD0iMTIiIGZpbGw9IiNGN0Y3RjciLz4KPHBhdGggZD0iTTQzLjEyMjkgNTUuMDE3N0w0NC4wNTk2IDU2LjMzOTlMNDUuMDUxNCA1NS4wMTc3TDUzLjcwMjEgNDMuNzIzOEw1NC4xOTggNDMuMDYyN0w1My43NTcyIDQyLjM0NjVMNDUuODc3OSAzMC42NjY5VjMwLjYxMTlMNDQuMzkwMiAyOC41NzM0TDMzLjU5MDcgMTIuMjExMUwzMy4yNjAxIDExLjY2MDJIMzIuNTk4OUgxMy41ODk1SDExLjE2NTJMMTIuNTk3OCAxMy41ODg0TDQzLjEyMjkgNTUuMDE3N1oiIGZpbGw9IiMyOTI5MjkiLz4KPHBhdGggZD0iTTEwMy43ODggMTFIOTguNTUzM0M4OS40MDY4IDExIDgxLjgwMyAxMi45MjgyIDc0LjQ3NDggMjIuMTgzN0wxMi40MzI2IDEwNi44NkwxMSAxMDguNzg5SDEzLjM2OTNIMzEuNjYyNEgzMi4yNjg1TDMyLjY1NDIgMTA4LjI5M0w0OS4wNzM5IDg1LjUzOTZMNTcuMjI4NiA3NC4zNTZMNzMuMzcyOCA5Ni41MDNDNzkuODc0NiAxMDUuNTkzIDg3LjIwMjggMTA5LjI4NCA5OC41NTMzIDEwOS4yODRIMTAzLjc4OEgxMDVWMTA4LjA3MlY5Mi45NzcxVjkxLjc2NTFIMTAzLjc4OEM5NS4zNTc2IDkxLjc2NTEgOTEuODMxMiA5MS4xNTkgODguOTY2IDg3LjYzMzJMNjguMjQ4NSA1OS4yMDU2TDgzLjk1MTkgMzcuODI5OUw4NS42NiAzNS40MDU4QzkwLjEyMzEgMjkuNzMxMyA5Mi45ODgzIDI4LjYyOTUgMTAzLjczMyAyOC41NzQ0SDEwNC45NDVWMjcuMzYyNFYxMi4yMTJWMTFIMTAzLjc4OFoiIGZpbGw9IiMyOTI5MjkiLz4KPC9zdmc+Cg==";
    readonly supportedTransactionVersions: Set<TransactionVersion> = new Set(["legacy", 0]);;

    #readyState: WalletReadyState =
        typeof navigator !== "undefined" && navigator.bluetooth ? WalletReadyState.Loadable
            : typeof window !== "undefined" && typeof document !== "undefined" ? WalletReadyState.NotDetected
                : WalletReadyState.Unsupported;
    #publicKey: PublicKey | null = null;
    #connecting: boolean = false;
    #wallet: WalletInterface | null = null;


    constructor(path = "m/44'/501'/0'") {
        super();

        if (this.#readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                // @ts-ignore
                if (window.secuxwallet) {
                    this.#wallet = new InstallableWallet(this);
                    this.#readyState = WalletReadyState.Installed;
                    this.emit("readyStateChange", this.#readyState);

                    return true;
                }

                return false;
            });
        }

        if (this.#readyState === WalletReadyState.Loadable) {
            this.#wallet = new LoadableWallet(this, path);
            this.#readyState = WalletReadyState.Installed;
        }
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this.#readyState !== WalletReadyState.Loadable && this.#readyState !== WalletReadyState.Installed) {
                throw new WalletNotReadyError();
            }

            this.#connecting = true;

            this.#publicKey = await this.#wallet!.connect();
            this.emit("connect", this.#publicKey);
        }
        catch (error: any) {
            this.emit("error", error);
            throw error;
        }
        finally {
            this.#connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        try {
            await this.#wallet!.disconnect();
        } catch (error: any) {
            this.emit("error", error);
        }

        this.#publicKey = null;

        this.emit("disconnect");
    }

    async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
        try {
            return await this.#wallet!.signTransaction(transaction);
        } catch (error: any) {
            this.emit("error", error);
            throw error;
        }
    }

    async signTransactionWithImage<T extends Transaction | VersionedTransaction>(
        transaction: T, image: string | Buffer, metadata: FileAttachment
    ): Promise<T> {
        try {
            return await this.#wallet!.signTransactionWithImage(transaction, image, metadata);
        } catch (error: any) {
            this.emit("error", error);
            throw error;
        }
    }

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        try {
            return await this.#wallet!.signMessage(message);
        } catch (error: any) {
            this.emit("error", error);
            throw error;
        }
    }

    get readyState() {
        return this.#readyState;
    }

    get publicKey() {
        return this.#publicKey;
    }

    get connecting() {
        return this.#connecting;
    }
}
