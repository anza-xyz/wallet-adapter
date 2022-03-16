import { WalletError } from '@solana/wallet-adapter-base';
export class WalletNotSelectedError extends WalletError {
    constructor() {
        super(...arguments);
        this.name = 'WalletNotSelectedError';
    }
}
//# sourceMappingURL=errors.js.map