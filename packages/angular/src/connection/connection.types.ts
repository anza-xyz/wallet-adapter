import { Connection } from "@solana/web3.js";

export interface ConnectionState {
    connection: Connection | null;
}
