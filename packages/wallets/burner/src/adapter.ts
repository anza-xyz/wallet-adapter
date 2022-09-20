import type { WalletName } from '@solana/wallet-adapter-base';
import { BaseSignerWalletAdapter, WalletNotConnectedError, WalletReadyState } from '@solana/wallet-adapter-base';
import type { PublicKey, Transaction, TransactionVersion, VersionedTransaction } from '@solana/web3.js';
import { Keypair } from '@solana/web3.js';

export const BurnerWalletName = 'Burner Wallet' as WalletName<'Burner Wallet'>;

/**
 * This burner wallet adapter is insecure and is only included to provide an easy way for applications to test the
 * wallet adapter framework without using a third-party wallet.
 */
export class InsecureBurnerWalletAdapter extends BaseSignerWalletAdapter {
    name = BurnerWalletName;
    url = 'https://github.com/solana-labs/wallet-adapter#usage';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMzAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zNCAxMC42djIuN2wtOS41IDE2LjVoLTQuNmw2LTEwLjVhMi4xIDIuMSAwIDEgMCAyLTMuNGw0LjgtOC4zYTQgNCAwIDAgMSAxLjMgM1ptLTQuMyAxOS4xaC0uNmw0LjktOC40djQuMmMwIDIuMy0yIDQuMy00LjMgNC4zWm0yLTI4LjRjLS4zLS44LTEtMS4zLTItMS4zaC0xLjlsLTIuNCA0LjNIMzBsMS43LTNabS0zIDVoLTQuNkwxMC42IDI5LjhoNC43TDI4LjggNi40Wk0xOC43IDBoNC42bC0yLjUgNC4zaC00LjZMMTguNiAwWk0xNSA2LjRoNC42TDYgMjkuOEg0LjJjLS44IDAtMS43LS4zLTIuNC0uOEwxNSA2LjRaTTE0IDBIOS40TDcgNC4zaDQuNkwxNCAwWm0tMy42IDYuNEg1LjdMMCAxNi4ydjhMMTAuMyA2LjRaTTQuMyAwaC40TDAgOC4ydi00QzAgMiAxLjkgMCA0LjMgMFoiIGZpbGw9IiM5OTQ1RkYiLz48L3N2Zz4=';
    supportedTransactionVersions: Set<TransactionVersion> = new Set(['legacy', 0]);

    /**
     * Storing a keypair locally like this is insecure because a supply chain attack on an application using this
     * adapter could retrieve the secret key.
     */
    private _keypair: Keypair | null = null;

    constructor() {
        super();
        console.warn(
            'Your application is presently configured to use the `InsecureBurnerWalletAdapter`. ' +
                'Find and remove it, then replace it with a list of adapters for ' +
                'wallets you would like your application to support. See ' +
                'https://github.com/solana-labs/wallet-adapter#usage for an example.'
        );
    }

    get connecting() {
        return false;
    }

    get publicKey() {
        return this._keypair && this._keypair.publicKey;
    }

    get readyState() {
        return WalletReadyState.Installed;
    }

    async connect(): Promise<void> {
        this._keypair = new Keypair();
        this.emit('connect', this._keypair.publicKey);
    }

    async disconnect(): Promise<void> {
        this._keypair = null;
        this.emit('disconnect');
    }

    async sendTransaction(
        transaction: Transaction | VersionedTransaction,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        transaction = await this.signTransaction(transaction);
        const rawTransaction = transaction.serialize();
        return connection.sendRawTransaction(rawTransaction, options);
    }

    async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
        if (this._keypair === null) throw new WalletNotConnectedError();

        const signers = [this._keypair];
        if ('version' in transaction) {
            transaction.sign(signers);
        } else {
            transaction.sign(...signers);
        }

        return transaction;
    }
}
