import { InjectionToken } from "@angular/core";
import { ConnectionConfig } from "@solana/web3.js";

export const CONNECTION_CONFIG = new InjectionToken<ConnectionConfig>(
    "connectionConfig"
);
