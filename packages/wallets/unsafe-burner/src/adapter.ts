import { ed25519 } from '@noble/curves/ed25519';
import { BaseNonceWalletAdapter, NonceContainer,  WalletAdapterNetwork,  WalletName, WalletNonceAlreadyExistsError } from '@solana/wallet-adapter-base';
import {
    isVersionedTransaction,
    WalletNotConnectedError,
    WalletReadyState,
} from '@solana/wallet-adapter-base';
import { Connection, NONCE_ACCOUNT_LENGTH, TransactionVersion, VersionedTransaction, Keypair, Transaction, SystemProgram, PublicKey, clusterApiUrl } from '@solana/web3.js';

export const UnsafeBurnerWalletName = 'Burner Wallet' as WalletName<'Burner Wallet'>;

export interface UnsafeBurnerAdapterConfig {
    network?: WalletAdapterNetwork;
}

//testjcZBA5u7ybUT9zpmJjMiLh2z18UzvW5vugyNJVp
const userPrivateKey = new Uint8Array([0]);

//Non9fKyoGUxkH3mGpR1eGNTpamdRkDctTARYee54CVC
const noncePrivateKey = new Uint8Array([0]);


/**
 * This burner wallet adapter is unsafe to use and is only included to provide an easy way for applications to test
 * Wallet Adapter without using a third-party wallet.
 */
export class UnsafeBurnerWalletAdapter extends BaseNonceWalletAdapter {
    name = UnsafeBurnerWalletName;
    url = 'https://github.com/solana-labs/wallet-adapter#usage';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMzAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zNCAxMC42djIuN2wtOS41IDE2LjVoLTQuNmw2LTEwLjVhMi4xIDIuMSAwIDEgMCAyLTMuNGw0LjgtOC4zYTQgNCAwIDAgMSAxLjMgM1ptLTQuMyAxOS4xaC0uNmw0LjktOC40djQuMmMwIDIuMy0yIDQuMy00LjMgNC4zWm0yLTI4LjRjLS4zLS44LTEtMS4zLTItMS4zaC0xLjlsLTIuNCA0LjNIMzBsMS43LTNabS0zIDVoLTQuNkwxMC42IDI5LjhoNC43TDI4LjggNi40Wk0xOC43IDBoNC42bC0yLjUgNC4zaC00LjZMMTguNiAwWk0xNSA2LjRoNC42TDYgMjkuOEg0LjJjLS44IDAtMS43LS4zLTIuNC0uOEwxNSA2LjRaTTE0IDBIOS40TDcgNC4zaDQuNkwxNCAwWm0tMy42IDYuNEg1LjdMMCAxNi4ydjhMMTAuMyA2LjRaTTQuMyAwaC40TDAgOC4ydi00QzAgMiAxLjkgMCA0LjMgMFoiIGZpbGw9IiM5OTQ1RkYiLz48L3N2Zz4=';
    supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0]);
    nonceContainer: NonceContainer | null;
    /**
     * Storing a keypair locally like this is not safe because any application using this adapter could retrieve the
     * secret key, and because the keypair will be lost any time the wallet is disconnected or the window is refreshed.
     */
    private _keypair: Keypair | null = null;
    private _network: WalletAdapterNetwork = WalletAdapterNetwork.Devnet;

    constructor() {
        super();
        this.nonceContainer = null;
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
        this.emit('connect', this._keypair.publicKey);
        await this.setNonceContainer(
            new Connection(clusterApiUrl(this._network)),
            Keypair.fromSecretKey(noncePrivateKey).publicKey,
            this._keypair.publicKey,
        );
    }

    async disconnect(): Promise<void> {
        this._keypair = null;
        this.nonceContainer = null;
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


    private async setNonceContainer(connection: Connection, noncePubkey: PublicKey, authorizedPubkey: PublicKey) {
        try {
            const nonceInfo = await this.fetchNonceInfo(connection, noncePubkey);
            this.nonceContainer = {
                nonceAccount: noncePubkey,
                nonceAuthority: authorizedPubkey,
                currentNonce: nonceInfo.nonce,
            }
        } catch (error) {
            this.nonceContainer = null;
        }
    }

    /**
     * 
     * Sample Implementation for initiating a nonce account for the wallet
     * This logic may be private to the adapter for use in Wallet's and not exposed to applications
     * @param connection Connection to Solana Cluster
     * 
     */
    async initiateNonce(connection: Connection, keypair?: Keypair) {
        if (this.nonceContainer) throw new WalletNonceAlreadyExistsError('Nonce account already exists!');
        try {
            const wallet = this._keypair;
            if (!wallet) throw new WalletNotConnectedError();
            const nonceKeypair = keypair ?? new Keypair();
            //ALT:
            //const nonceKeypair = Keypair.fromSecretKey(noncePrivateKey);
            const transaction = new Transaction();
            const rent = await connection.getMinimumBalanceForRentExemption(NONCE_ACCOUNT_LENGTH);
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            transaction.feePayer = wallet.publicKey;
            transaction.recentBlockhash = blockhash;
            transaction.lastValidBlockHeight = lastValidBlockHeight;
            transaction.add(
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
            transaction.sign(nonceKeypair, wallet);
            try {
                const signature = await this.sendTransaction(transaction, connection)
                await connection.confirmTransaction({
                    signature,
                    blockhash,
                    lastValidBlockHeight
                });
                await this.setNonceContainer(connection, nonceKeypair.publicKey, wallet.publicKey);
            } catch (error) {
                throw error;
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    };
}