var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BaseSignerWalletAdapter, pollUntilReady, WalletAccountError, WalletNotConnectedError, WalletNotFoundError, WalletNotInstalledError, WalletPublicKeyError, WalletSignTransactionError, } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
export class Coin98WalletAdapter extends BaseSignerWalletAdapter {
    constructor(config = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
        if (!this.ready)
            pollUntilReady(this, config.pollInterval || 1000, config.pollCount || 3);
    }
    get publicKey() {
        return this._publicKey;
    }
    get ready() {
        return !!window.coin98;
    }
    get connecting() {
        return this._connecting;
    }
    get connected() {
        var _a;
        return !!((_a = this._wallet) === null || _a === void 0 ? void 0 : _a.isConnected());
    }
    get autoApprove() {
        return false;
    }
    connect() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.connected || this.connecting)
                    return;
                this._connecting = true;
                const wallet = (_a = window.coin98) === null || _a === void 0 ? void 0 : _a.sol;
                if (!wallet)
                    throw new WalletNotFoundError();
                if (!wallet.isCoin98)
                    throw new WalletNotInstalledError();
                let account;
                try {
                    [account] = yield wallet.connect();
                }
                catch (error) {
                    throw new WalletAccountError(error === null || error === void 0 ? void 0 : error.message, error);
                }
                let publicKey;
                try {
                    publicKey = new PublicKey(account);
                }
                catch (error) {
                    throw new WalletPublicKeyError(error === null || error === void 0 ? void 0 : error.message, error);
                }
                this._wallet = wallet;
                this._publicKey = publicKey;
                this.emit('connect');
            }
            catch (error) {
                this.emit('error', error);
                throw error;
            }
            finally {
                this._connecting = false;
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._wallet) {
                this._wallet.disconnect();
                this._wallet = null;
                this._publicKey = null;
                this.emit('disconnect');
            }
        });
    }
    signTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const wallet = this._wallet;
                if (!wallet)
                    throw new WalletNotConnectedError();
                try {
                    const response = yield wallet.request({ method: 'sol_sign', params: [transaction] });
                    const publicKey = new PublicKey(response.publicKey);
                    const signature = bs58.decode(response.signature);
                    transaction.addSignature(publicKey, signature);
                    return transaction;
                }
                catch (error) {
                    throw new WalletSignTransactionError(error === null || error === void 0 ? void 0 : error.message, error);
                }
            }
            catch (error) {
                this.emit('error', error);
                throw error;
            }
        });
    }
    signAllTransactions(transactions) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const wallet = this._wallet;
                if (!wallet)
                    throw new WalletNotConnectedError();
                try {
                    return yield Promise.all(transactions.map((transaction) => this.signTransaction(transaction)));
                }
                catch (error) {
                    throw new WalletSignTransactionError(error === null || error === void 0 ? void 0 : error.message, error);
                }
            }
            catch (error) {
                this.emit('error', error);
                throw error;
            }
        });
    }
}
//# sourceMappingURL=adapter.js.map