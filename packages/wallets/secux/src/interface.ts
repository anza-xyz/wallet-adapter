import type { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import type { FileAttachment } from "@secux/protocol-device/lib/interface";


export interface WalletInterface {
    connect(): Promise<PublicKey>;
    disconnect(): Promise<void>;
    signMessage(message: Uint8Array): Promise<Uint8Array>;
    signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
    signTransactionWithImage<T extends Transaction | VersionedTransaction>(
        transaction: T,
        image: string | Buffer,
        metadata: FileAttachment
    ): Promise<T>;
}