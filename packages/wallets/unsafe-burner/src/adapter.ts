import { ed25519 } from '@noble/curves/ed25519';
import { NonceContainer, SendTransactionOptions, TransactionOrVersionedTransaction, WalletName, WalletNonceAlreadyExistsError, WalletNonceNotFoundError, WalletNoNonceError, WalletSendTransactionError, WalletSignTransactionError, EventEmitter } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    isVersionedTransaction,
    WalletNotConnectedError,
    WalletReadyState,
} from '@solana/wallet-adapter-base';
import { Connection, NONCE_ACCOUNT_LENGTH, TransactionVersion, VersionedTransaction, Keypair, Transaction, SystemProgram, NonceAccount, TransactionSignature, PublicKey, clusterApiUrl } from '@solana/web3.js';

export const UnsafeBurnerWalletName = 'Burner Wallet' as WalletName<'Burner Wallet'>;

//testjcZBA5u7ybUT9zpmJjMiLh2z18UzvW5vugyNJVp
const userPrivateKey = new Uint8Array([0]);

//Non9fKyoGUxkH3mGpR1eGNTpamdRkDctTARYee54CVC
const noncePrivateKey = new Uint8Array([0]);


/**
 * This burner wallet adapter is unsafe to use and is only included to provide an easy way for applications to test
 * Wallet Adapter without using a third-party wallet.
 */
export class UnsafeBurnerWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = UnsafeBurnerWalletName;
    url = 'https://github.com/solana-labs/wallet-adapter#usage';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMzAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zNCAxMC42djIuN2wtOS41IDE2LjVoLTQuNmw2LTEwLjVhMi4xIDIuMSAwIDEgMCAyLTMuNGw0LjgtOC4zYTQgNCAwIDAgMSAxLjMgM1ptLTQuMyAxOS4xaC0uNmw0LjktOC40djQuMmMwIDIuMy0yIDQuMy00LjMgNC4zWm0yLTI4LjRjLS4zLS44LTEtMS4zLTItMS4zaC0xLjlsLTIuNCA0LjNIMzBsMS43LTNabS0zIDVoLTQuNkwxMC42IDI5LjhoNC43TDI4LjggNi40Wk0xOC43IDBoNC42bC0yLjUgNC4zaC00LjZMMTguNiAwWk0xNSA2LjRoNC42TDYgMjkuOEg0LjJjLS44IDAtMS43LS4zLTIuNC0uOEwxNSA2LjRaTTE0IDBIOS40TDcgNC4zaDQuNkwxNCAwWm0tMy42IDYuNEg1LjdMMCAxNi4ydjhMMTAuMyA2LjRaTTQuMyAwaC40TDAgOC4ydi00QzAgMiAxLjkgMCA0LjMgMFoiIGZpbGw9IiM5OTQ1RkYiLz48L3N2Zz4=';
    supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0]);
    nonceContainer: NonceContainer | undefined;
    /**
     * Storing a keypair locally like this is not safe because any application using this adapter could retrieve the
     * secret key, and because the keypair will be lost any time the wallet is disconnected or the window is refreshed.
     */
    private _keypair: Keypair | null = null;

    constructor() {
        super();
        this.nonceContainer = undefined;
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

    get nonce() {
        return this.nonceContainer && this.nonceContainer;
    }

    async connect(): Promise<void> {
        this._keypair = Keypair.fromSecretKey(userPrivateKey);
        this.setNonceContainer(
            new Connection(clusterApiUrl('devnet')),
            Keypair.fromSecretKey(noncePrivateKey).publicKey,
            this._keypair.publicKey,
        );
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

    /**
     * 
     * Sample Implementation for initiating a nonce account for the wallet
     * (We are calling it "Turbo Mode" here for the user)
     * This logic would be normally stored in the Wallet's backend
     * @param connection Connection to Solana Cluster
     * 
     */
    private initiateTurbo = async (connection: Connection,) => {
        if (this.nonceContainer) throw new WalletNonceAlreadyExistsError();

        try {
            const wallet = this._keypair;
            const nonceKeypair = Keypair.fromSecretKey(noncePrivateKey);
            if (!wallet) throw new WalletNotConnectedError();
            const newNonceTx = new Transaction();
            const rent = await connection.getMinimumBalanceForRentExemption(NONCE_ACCOUNT_LENGTH);
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            newNonceTx.feePayer = wallet.publicKey;
            newNonceTx.recentBlockhash = blockhash;
            newNonceTx.lastValidBlockHeight = lastValidBlockHeight;
            newNonceTx.add(
                SystemProgram.createAccount({
                    fromPubkey: wallet.publicKey,
                    newAccountPubkey: nonceKeypair.publicKey,
                    lamports: rent,
                    space: NONCE_ACCOUNT_LENGTH,
                    programId: SystemProgram.programId,
                }),
                SystemProgram.nonceInitialize({
                    noncePubkey: nonceKeypair.publicKey,
                    authorizedPubkey: wallet.publicKey,
                })
            );

            newNonceTx.sign(nonceKeypair, wallet);
            try {
                const signature = await connection.sendRawTransaction(newNonceTx.serialize());
                await connection.confirmTransaction({
                    signature,
                    blockhash,
                    lastValidBlockHeight
                });
                await this.setNonceContainer(connection, nonceKeypair.publicKey, wallet.publicKey);
                console.log("      Nonce Acct Created: ", signature);
            } catch (error) {
                console.error("Failed to create nonce account: ", error);
                throw error;
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    };
    private setNonceContainer = async (connection:Connection, noncePubkey: PublicKey, authorizedPubkey: PublicKey) => {
        try {
            const nonceInfo = await this.fetchNonceInfo(connection, noncePubkey);
            const advanceIx = SystemProgram.nonceAdvance({
                authorizedPubkey,
                noncePubkey
            })
            this.nonceContainer = {
                nonceAccount: noncePubkey,
                nonceAuthority: authorizedPubkey,
                currentNonce: nonceInfo.nonce,
                advanceNonce: advanceIx
            }
        } catch (error) {
            console.error("Nonce account not found. Creating new one.");
            await this.initiateTurbo(connection);
        }

    }
    private updateTurboState = async (connection: Connection, signature?: TransactionSignature) => {
        if (signature && this.nonceContainer) {
            await connection.confirmTransaction(
                {
                    signature,
                    minContextSlot: 0,
                    nonceAccountPubkey: this.nonceContainer?.nonceAccount,
                    nonceValue: this.nonceContainer?.currentNonce
                }, 'confirmed'
            );
        }
        if (!this.nonceContainer) throw new WalletNoNonceError();
        const nonceAccount = await this.fetchNonceInfo(connection, this.nonceContainer.nonceAccount);
        this.nonceContainer.currentNonce = nonceAccount.nonce;
    };
    private fetchNonceInfo = async (connection: Connection, noncePubkey: PublicKey) => {
        const accountInfo = await connection.getAccountInfo(noncePubkey);
        if (!accountInfo) throw new WalletNonceNotFoundError();
        const nonceAccount = NonceAccount.fromAccountData(accountInfo.data);
        return nonceAccount;
    }
    // Modification of Adapter to support updating TurboState (nonce account) on sendTransaction
    async sendTransaction(
        transaction: TransactionOrVersionedTransaction<this['supportedTransactionVersions']>,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        let emit = true;
        try {
            if (isVersionedTransaction(transaction)) {
                if (!this.supportedTransactionVersions)
                    throw new WalletSendTransactionError(
                        `Sending versioned transactions isn't supported by this wallet`
                    );

                if (!this.supportedTransactionVersions.has(transaction.version))
                    throw new WalletSendTransactionError(
                        `Sending transaction version ${transaction.version} isn't supported by this wallet`
                    );

                try {
                    transaction = await this.signTransaction(transaction);

                    const rawTransaction = transaction.serialize();

                    const result = await connection.sendRawTransaction(rawTransaction, options);
                    this.updateTurboState(connection, result);
                    return result;
                } catch (error: any) {
                    // If the error was thrown by `signTransaction`, rethrow it and don't emit a duplicate event
                    if (error instanceof WalletSignTransactionError) {
                        emit = false;
                        throw error;
                    }
                    throw new WalletSendTransactionError(error?.message, error);
                }
            } else {
                try {
                    const { signers, ...sendOptions } = options;

                    signers?.length && transaction.partialSign(...signers);

                    transaction = await this.signTransaction(transaction); 

                    const rawTransaction = transaction.serialize();

                    const result = await connection.sendRawTransaction(rawTransaction, sendOptions);
                    this.updateTurboState(connection, result);
                    return result;
                } catch (error: any) {
                    // If the error was thrown by `signTransaction`, rethrow it and don't emit a duplicate event
                    if (error instanceof WalletSignTransactionError) {
                        emit = false;
                        throw error;
                    }
                    throw new WalletSendTransactionError(error?.message, error);
                }
            }
        } catch (error: any) {
            if (emit) {
                this.emit('error', error);
            }
            throw error;
        }
    }


}


