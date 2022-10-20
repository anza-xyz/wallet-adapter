import {
    WalletConnectionError, WalletDisconnectionError, WalletLoadError, WalletNotConnectedError
} from "@solana/wallet-adapter-base";
import { PublicKey } from "@solana/web3.js";
import type { BaseWalletAdapter } from "@solana/wallet-adapter-base";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { WalletInterface } from "./interface";
import { FileAttachment } from "@secux/protocol-device/lib/interface";
import type { SecuxWalletHandler } from "@secux/transport-handler";


interface SecuxWindow extends Window {
    secuxwallet?: SecuxWalletHandler
}
declare const window: SecuxWindow;

interface SecuxWallet extends SecuxWalletHandler {
    path?: string;
}


export class InstallableWallet implements WalletInterface {
    #adapter: BaseWalletAdapter;
    #wallet: SecuxWallet | null = null;
    #path: string;


    constructor(base: BaseWalletAdapter) {
        this.#adapter = base;
        this.#path = "m/44'/501'/0'";
    }

    async connect(): Promise<PublicKey> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.#wallet = window.secuxwallet!;
        this.#wallet.on("disconnect", this.#disconnected);

        const path = this.#wallet.path;
        if (path) this.#path = path;

        try {
            await this.#wallet.Connect();
        } catch (error: any) {
            throw new WalletConnectionError(error?.message, error);
        }

        const { getAddress } = await import("./utils");
        return getAddress(this.#wallet, this.#path);
    }

    async disconnect(): Promise<void> {
        const wallet = this.#wallet;
        if (!wallet) return;

        this.#wallet = null;

        try {
            await wallet.Disconnect();
        } catch (error: any) {
            throw new WalletDisconnectionError(error?.message, error);
        }
    }

    async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
        const wallet = this.#wallet;
        if (!wallet) throw new WalletNotConnectedError();

        try {
            const { serializeTransaction, signTransaction } = await import("./utils");
            wallet.emit("signTransaction", serializeTransaction(transaction).toString("base64"));

            return signTransaction(
                {
                    transport: wallet,
                    path: this.#path,
                    publickey: this.#adapter.publicKey!
                },
                transaction
            )
        } catch (error: any) {
            throw new WalletLoadError(error?.message, error);
        }
    }

    async signTransactionWithImage<T extends Transaction | VersionedTransaction>(
        transaction: T, image: string | Buffer, metadata: FileAttachment
    ): Promise<T> {
        const wallet = this.#wallet;
        if (!wallet) throw new WalletNotConnectedError();


        let beginSendImage = false;
        const prevEvent = wallet.OnNotification;
        wallet.OnNotification = (data: Buffer) => {
            prevEvent?.(data);
            beginSendImage = true;
            wallet.OnNotification = prevEvent;
        }

        try {
            const { serializeTransaction, signTransactionWithImage } = await import("./utils");
            wallet.emit("signTransactionWithImage", serializeTransaction(transaction).toString("base64"));

            return signTransactionWithImage(
                {
                    transport: wallet,
                    path: this.#path,
                    publickey: this.#adapter.publicKey!,
                    beginSendImage: () => beginSendImage
                },
                transaction,
                image,
                metadata
            )
        } catch (error: any) {
            throw new WalletLoadError(error?.message, error);
        }
    }

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        const wallet = this.#wallet;
        if (!wallet) throw new WalletNotConnectedError();

        wallet.emit("signMessage", Buffer.from(message).toString("base64"));

        try {
            const { signMessage } = await import("./utils");
            return signMessage(
                {
                    transport: wallet,
                    path: this.#path,
                    publickey: this.#adapter.publicKey!
                },
                message
            )
        } catch (error: any) {
            throw new WalletLoadError(error?.message, error);
        }
    }

    #disconnected = () => {
        const wallet = this.#wallet;
        if (!wallet) return;

        this.#wallet = null;

        this.#adapter.emit("disconnect");
    }
}