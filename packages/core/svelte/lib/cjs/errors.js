"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletNotSelectedError = void 0;
const wallet_adapter_base_1 = require("@solana/wallet-adapter-base");
class WalletNotSelectedError extends wallet_adapter_base_1.WalletError {
    constructor() {
        super(...arguments);
        this.name = 'WalletNotSelectedError';
    }
}
exports.WalletNotSelectedError = WalletNotSelectedError;
//# sourceMappingURL=errors.js.map