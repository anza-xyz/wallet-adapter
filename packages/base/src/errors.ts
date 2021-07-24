export class WalletError extends Error {
    public error: any;

    constructor(message?: string, error?: any) {
        super(message);
        this.error = error;
    }
}

export class WalletNotFoundError extends WalletError {
    name = 'WalletNotFoundError';
}

export class WalletNotInstalledError extends WalletError {
    name = 'WalletNotInstalledError';
}

export class WalletNotReadyError extends WalletError {
    name = 'WalletNotReadyError';
}

export class WalletConnectionError extends WalletError {
    name = 'WalletConnectionError';
}

export class WalletAccountError extends WalletError {
    name = 'WalletAccountError';
}

export class WalletPublicKeyError extends WalletError {
    name = 'WalletPublicKeyError';
}

export class WalletKeypairError extends WalletError {
    name = 'WalletKeypairError';
}

export class WalletNotConnectedError extends WalletError {
    name = 'WalletNotConnectedError';
}

export class WalletSignatureError extends WalletError {
    name = 'WalletSignatureError';
}

export class WalletWindowBlockedError extends WalletError {
    name = 'WalletWindowBlockedError';
}

export class WalletWindowClosedError extends WalletError {
    name = 'WalletWindowClosedError';
}
