import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { WalletLoadError, WalletNotConnectedError, WalletPublicKeyError, WalletSignMessageError, WalletSignTransactionError } from "@solana/wallet-adapter-base";
import type { ITransport } from "@secux/transport";
import { SecuxSOL } from "@secux/app-sol";
import type { FileAttachment, FileDestination } from "@secux/protocol-device/lib/interface";
import type { SecuxDeviceNifty } from "@secux/protocol-device";


interface wallet {
    transport: ITransport;
    path: string;
    publickey: PublicKey;
    beginSendImage?: () => boolean;
}


export async function getAddress(transport: ITransport, path: string) {
    if (!transport) throw new WalletNotConnectedError();

    try {
        const data = SecuxSOL.prepareAddress(path);
        const rsp = await transport.Exchange(data as Buffer);
        const publicKey = new PublicKey(SecuxSOL.resolveAddress(rsp));

        return publicKey;
    } catch (error: any) {
        throw new WalletPublicKeyError(error?.message, error);
    }
}

export async function signTransaction<T extends Transaction | VersionedTransaction>(
    wallet: wallet, transaction: T
): Promise<T> {
    const { transport, path, publickey } = wallet;
    if (!transport) throw new WalletNotConnectedError();

    try {
        const account = publickey.toString();
        const { commandData } = SecuxSOL.prepareSignSerialized(
            account,
            serializeTransaction(transaction),
            [{ path, account }]
        );

        const rsp = await transport.Exchange(commandData as Buffer);
        const signature = Buffer.from(SecuxSOL.resolveSignature(rsp), "base64");

        if (transaction instanceof VersionedTransaction) {
            const signerIndex = transaction.message.staticAccountKeys.findIndex(pubkey => publickey.equals(pubkey));
            transaction.signatures[signerIndex] = signature;
        }
        else {
            transaction.addSignature(publickey, signature);
        }
    } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
    }

    return transaction;
}

export async function signTransactionWithImage<T extends Transaction | VersionedTransaction>(
    wallet: wallet, transaction: T, image: string | Buffer, metadata: FileAttachment
): Promise<T> {
    const { transport } = wallet;
    if (!transport) throw new WalletNotConnectedError();

    let nifty: typeof SecuxDeviceNifty;
    let fileDest: typeof FileDestination;
    try {
        nifty = (await import("@secux/protocol-device")).SecuxDeviceNifty;
        fileDest = (await import("@secux/protocol-device/lib/interface")).FileDestination;
    } catch (error: any) {
        throw new WalletLoadError(error?.message, error);
    }

    // prepare command data for image and check if device supported.
    let dataList: any;
    try {
        dataList = nifty.prepareSendImage(
            ".jpg",
            image,
            metadata,
            fileDest.CONFIRM
        );
    } catch (error) {
        // crypto wallet doesn't support image feature.
        return await signTransaction(wallet, transaction);
    }

    try {
        // begin signing
        const task = signTransaction(wallet, transaction);
        while (!wallet.beginSendImage?.()) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // send image
        for (const data of dataList) await transport.Exchange(data as Buffer);

        // user interaction
        const tx = await task;

        return tx;
    } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
    }
}

export async function signMessage(wallet: wallet, message: Uint8Array): Promise<Uint8Array> {
    const { transport, path } = wallet;
    if (!transport) throw new WalletNotConnectedError();

    try {
        const data = SecuxSOL.prepareSignMessage(path, Buffer.from(message));
        const rsp = await transport.Exchange(data as Buffer);
        const signature = Buffer.from(SecuxSOL.resolveSignature(rsp), "base64");

        return signature;
    } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error);
    }
}

export function serializeTransaction(transaction: Transaction | VersionedTransaction): Buffer {
    if (transaction instanceof VersionedTransaction) {
        return Buffer.from(transaction.message.serialize());
    }

    return transaction.serializeMessage();
}