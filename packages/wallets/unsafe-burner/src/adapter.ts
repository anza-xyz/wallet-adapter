import { ed25519 } from '@noble/curves/ed25519';
import type { SignAndSendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
import {
    BaseSignInMessageSignerWalletAdapter,
    isVersionedTransaction,
    WalletError,
    WalletNotConnectedError,
    WalletReadyState,
    WalletSendTransactionError,
    WalletSignTransactionError,
    WalletSignAndSendAllTransactionsError,
} from '@solana/wallet-adapter-base';
import { type SolanaSignInInput, type SolanaSignInOutput } from '@solana/wallet-standard-features';
import { createSignInMessage } from '@solana/wallet-standard-util';
import type {
    Connection,
    Transaction,
    TransactionSignature,
    TransactionVersion,
    VersionedTransaction,
} from '@solana/web3.js';
import { Keypair } from '@solana/web3.js';

export const UnsafeBurnerWalletName = 'Burner Wallet' as WalletName<'Burner Wallet'>;

/**
 * This burner wallet adapter is unsafe to use and is only included to provide an easy way for applications to test
 * Wallet Adapter without using a third-party wallet.
 */
export class UnsafeBurnerWalletAdapter extends BaseSignInMessageSignerWalletAdapter {
    name = UnsafeBurnerWalletName;
    url = 'https://github.com/solana-labs/wallet-adapter#usage';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMzAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zNCAxMC42djIuN2wtOS41IDE2LjVoLTQuNmw2LTEwLjVhMi4xIDIuMSAwIDEgMCAyLTMuNGw0LjgtOC4zYTQgNCAwIDAgMSAxLjMgM1ptLTQuMyAxOS4xaC0uNmw0LjktOC40djQuMmMwIDIuMy0yIDQuMy00LjMgNC4zWm0yLTI4LjRjLS4zLS44LTEtMS4zLTItMS4zaC0xLjlsLTIuNCA0LjNIMzBsMS43LTNabS0zIDVoLTQuNkwxMC42IDI5LjhoNC43TDI4LjggNi40Wk0xOC43IDBoNC42bC0yLjUgNC4zaC00LjZMMTguNiAwWk0xNSA2LjRoNC42TDYgMjkuOEg0LjJjLS44IDAtMS43LS4zLTIuNC0uOEwxNSA2LjRaTTE0IDBIOS40TDcgNC4zaDQuNkwxNCAwWm0tMy42IDYuNEg1LjdMMCAxNi4ydjhMMTAuMyA2LjRaTTQuMyAwaC40TDAgOC4ydi00QzAgMiAxLjkgMCA0LjMgMFoiIGZpbGw9IiM5OTQ1RkYiLz48L3N2Zz4=';
    supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0]);

    /**
     * Storing a keypair locally like this is not safe because any application using this adapter could retrieve the
     * secret key, and because the keypair will be lost any time the wallet is disconnected or the window is refreshed.
     */
    private _keypair: Keypair | null = null;

    constructor() {
        super();
        console.warn(
            'Your application is presently configured to use the `UnsafeBurnerWalletAdapter`. ' +
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
        return WalletReadyState.Loadable;
    }

    async connect(): Promise<void> {
        this._keypair = new Keypair();
        this.emit('connect', this._keypair.publicKey);
    }

    async disconnect(): Promise<void> {
        this._keypair = null;
        this.emit('disconnect');
    }

    async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
        if (!this._keypair) throw new WalletNotConnectedError();

        if (isVersionedTransaction(transaction)) {
            transaction.sign([this._keypair]);
        } else {
            transaction.partialSign(this._keypair);
        }

        return transaction;
    }

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        if (!this._keypair) throw new WalletNotConnectedError();

        return ed25519.sign(message, this._keypair.secretKey.slice(0, 32));
    }

    async signIn(input: SolanaSignInInput = {}): Promise<SolanaSignInOutput> {
        const { publicKey, secretKey } = (this._keypair ||= new Keypair());
        const domain = input.domain || window.location.host;
        const address = input.address || publicKey.toBase58();

        const signedMessage = createSignInMessage({
            ...input,
            domain,
            address,
        });
        const signature = ed25519.sign(signedMessage, secretKey.slice(0, 32));

        this.emit('connect', publicKey);

        return {
            account: {
                address,
                publicKey: publicKey.toBytes(),
                chains: [],
                features: [],
            },
            signedMessage,
            signature,
        };
    }

    async signAndSendAllTransactions<T extends Transaction | VersionedTransaction>(
        transactions: T[],
        connection: Connection,
        options: SignAndSendTransactionOptions = {}
    ): Promise<(TransactionSignature | WalletSignAndSendAllTransactionsError)[]> {
        try {
            if (!this._keypair) throw new WalletNotConnectedError();

            try {
                const { signers, ...sendOptions } = options;
                sendOptions.preflightCommitment = sendOptions.preflightCommitment || connection.commitment;

                transactions = await Promise.all(
                    transactions.map(async (transaction) => {
                        if (isVersionedTransaction(transaction)) {
                            signers?.length && transaction.sign(signers);
                        } else {
                            transaction = (await this.prepareTransaction(transaction, connection, sendOptions)) as T;
                            signers?.length && (transaction as Transaction).partialSign(...signers);
                        }
                        return transaction;
                    })
                );

                for (const transaction of transactions) {
                    if (isVersionedTransaction(transaction)) {
                        if (!this.supportedTransactionVersions)
                            throw new WalletSignTransactionError(
                                `Signing versioned transactions isn't supported by this wallet`
                            );

                        if (!this.supportedTransactionVersions.has(transaction.version))
                            throw new WalletSignTransactionError(
                                `Signing transaction version ${transaction.version} isn't supported by this wallet`
                            );
                    }
                }

                // Sign and send transactions in parallel
                const sendPromises = transactions.map(async (transaction) => {
                    const signedTransaction = await this.signTransaction(transaction);
                    const rawTransaction = signedTransaction.serialize();
                    return connection.sendRawTransaction(rawTransaction, options);
                });

                // Use Promise.allSettled to wait for all sendPromises to settle
                const sendResults = await Promise.allSettled(sendPromises);

                // Process results
                const result = sendResults.map((result) => {
                    if (result.status === 'fulfilled') return result.value;
                    return new WalletSignAndSendAllTransactionsError(result.reason);
                });

                return result;
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletSendTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
}
