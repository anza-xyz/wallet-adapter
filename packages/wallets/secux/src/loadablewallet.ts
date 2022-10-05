import type { SecuxWebBLE } from "@secux/transport-webble";
import type { ITransport } from "@secux/transport";
import type { FileAttachment } from "@secux/protocol-device/lib/interface";
import {
    BaseWalletAdapter, WalletDisconnectedError, WalletDisconnectionError, WalletNotConnectedError
} from "@solana/wallet-adapter-base";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { WalletConnectionError, WalletLoadError } from "@solana/wallet-adapter-base";
import { WalletInterface } from "./interface";


export class LoadableWallet implements WalletInterface {
    #adapter: BaseWalletAdapter;
    #transport: ITransport | null = null;
    #path: string;
    #beginSendImage: boolean = false;


    constructor(base: BaseWalletAdapter, path: string) {
        this.#adapter = base;
        this.#path = path;
    }

    async connect(): Promise<PublicKey> {
        let ble: typeof SecuxWebBLE;
        try {
            ble = (await import("@secux/transport-webble")).SecuxWebBLE;
        } catch (error: any) {
            throw new WalletLoadError(error?.message, error);
        }

        try {
            const { DeviceType } = await import("@secux/transport/lib/interface");

            const device = await ble.Create(
                undefined,
                this.#disconnected,
                [DeviceType.crypto, DeviceType.nifty]
            );
            device.OnNotification = (data: Buffer) => {
                this.#beginSendImage = true;
            };

            await device.Connect();
            if (device.DeviceType === DeviceType.crypto) {
                const otp = prompt("Please enter otp showing on your SecuX");
                await device.SendOTP(otp!);
            }

            this.#transport = device;
        } catch (error: any) {
            throw new WalletConnectionError(error?.message, error);
        }

        const { getAddress } = await import("./utils");
        return await getAddress(this.#transport, this.#path);
    }

    async disconnect(): Promise<void> {
        const transport = this.#transport;
        if (!transport) return;

        this.#transport = null;

        try {
            await transport.Disconnect();
        } catch (error: any) {
            throw new WalletDisconnectionError(error?.message, error);
        }
    }

    async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
        const transport = this.#transport;
        if (!transport) throw new WalletNotConnectedError();

        try {
            const { signTransaction } = await import("./utils");
            return signTransaction(
                {
                    transport,
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
        const transport = this.#transport;
        if (!transport) throw new WalletNotConnectedError();

        try {
            const { signTransactionWithImage } = await import("./utils");
            return signTransactionWithImage(
                {
                    transport,
                    path: this.#path,
                    publickey: this.#adapter.publicKey!,
                    beginSendImage: () => this.#beginSendImage
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
        const transport = this.#transport;
        if (!transport) throw new WalletNotConnectedError();

        try {
            const { signMessage } = await import("./utils");
            return signMessage(
                {
                    transport,
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
        const transport = this.#transport;
        if (!transport) return;

        this.#transport = null;

        this.#adapter.emit("error", new WalletDisconnectedError());
        this.#adapter.emit("disconnect");
    }
}