import { WalletError } from '@solana/wallet-adapter-base';

export class WalletNotSelectedError extends WalletError {
    name = 'WalletNotSelectedError';
}

export class OperationNotSupportedByWalletError extends WalletError {
    name = 'OperationNotSupportedByWalletError';
}
