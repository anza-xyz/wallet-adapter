import { WalletError } from "@solana/wallet-adapter-base";

export class WalletNotSelectedError extends WalletError {
    constructor() {
        super();
        this.name = "WalletNotSelectedError";
    }
}

export class SignTransactionNotFoundError extends WalletError {
    constructor() {
        super();
        this.name = "SignTransactionNotFoundError";
    }
}

export class SignAllTransactionsNotFoundError extends WalletError {
    constructor() {
        super();
        this.name = "SignAllTransactionsNotFoundError";
    }
}
