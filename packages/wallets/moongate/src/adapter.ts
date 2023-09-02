import type { SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    WalletAccountError,
    WalletConfigError,
    WalletConnectionError,
    WalletDisconnectionError,
    WalletError,
    WalletLoadError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSendTransactionError,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import { Connection, Transaction, TransactionSignature } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import  { MoonGateEmbed } from '@moongate/solana-wallet-sdk';
export const MoongateWalletName = 'MoonGate' as WalletName<'MoonGate'>;

export class MoongateWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = MoongateWalletName;
    url = 'https://moongate.one';
    icon = "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDEwMDAgMTAwMCIgd2lkdGg9IjEwMDAiIGhlaWdodD0iMTAwMCI+Cgk8dGl0bGU+bWctc3ZnPC90aXRsZT4KCTxzdHlsZT4KCQkuczAgeyBmaWxsOiAjMDAwMDAwIH0gCgkJLnMxIHsgZmlsbDogI2ZmZmZmZiB9IAoJPC9zdHlsZT4KCTxwYXRoIGlkPSJMYXllciAxIiBjbGFzcz0iczAiIGQ9Im0tMzEgMGgxMDYxLjh2MTAwMGgtMTA2MS44eiIvPgoJPHBhdGggaWQ9IkxheWVyIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsYXNzPSJzMSIgZD0ibTQxOS4yIDY1Ni4xYy00OC4zLTAuMS04OC4zLTE3LjgtMTIwLjEtNTMuMy0yNy4xLTMwLjktNDAuNy02Ny41LTQwLjctMTA5LjkgMC4xLTQ4LjcgMTcuNi04OSA1Mi42LTEyMC44IDMwLjQtMjcuNiA2Ni42LTQxLjQgMTA4LjUtNDEuNCA0OC43IDAuMSA4OC44IDE3LjggMTIwLjEgNTMuMyAyNy4xIDMwLjQgNDAuNyA2Ni44IDQwLjcgMTA5LjItMC4xIDQ5LjItMTcuNSA4OS43LTUyLjYgMTIxLjUtMjkuOSAyNy43LTY2LjEgNDEuNC0xMDguNSA0MS40em0tNjIuOC04Ny4xYzE3IDE2LjEgMzggMjQuMiA2Mi45IDI0LjIgMjkgMCA1Mi0xMC4zIDY5LjEtMzEgMTUuMS0xOC41IDIyLjgtNDEuNSAyMi44LTY5LjEgMC0zMS43LTkuNy01Ni44LTI4LjktNzUuMy0xNi41LTE2LjYtMzcuNi0yNC45LTYyLjktMjQuOS0yOSAwLTUyLjEgMTAuNi02OS4xIDMxLjctMTQuNyAxNy45LTIyLjEgNDAuOC0yMi4xIDY4LjQgMCAzMS43IDkuNCA1NyAyOC4yIDc2em01NTctMTg0LjdjMjcuMiAzMC40IDQwLjYgNjYuOCA0MC42IDEwOS4yIDAgNDkuMy0xNy41IDg5LjctNTIuNSAxMjEuNS0zMCAyNy42LTY2LjIgNDEuNC0xMDguNiA0MS40LTQ4LjItMC4xLTg4LjMtMTcuOC0xMjAuMS01My4zLTI3LjEtMzAuOC00MC43LTY3LjUtNDAuNi0xMDkuOSAwLTQ4LjcgMTcuNi04OSA1Mi42LTEyMC44IDMwLjQtMjcuNSA2Ni42LTQxLjQgMTA4LjQtNDEuMyA0OC45IDAgODkgMTcuNyAxMjAuMiA1My4yem0tNzk4LjYtMTM2LjJjNzQuOC05Mi45IDE4Ni4xLTE0Ni4yIDMwNS4yLTE0Ni4xIDEyNi4zIDAuMSAyNDUuNSA2MS43IDMxOC42IDE2NC44IDUuNiA3LjcgMy43IDE4LjYtNCAyNC4xLTMuMSAyLjItNi42IDMuMi0xMC4xIDMuMi01LjQgMC0xMC43LTIuNS0xNC4xLTcuMy02Ni44LTkzLjktMTc1LjMtMTUwLTI5MC40LTE1MC4xLTEwOC42LTAuMS0yMDkuOSA0OC40LTI3OC4yIDEzMy4yLTYgNy41LTE2LjggOC42LTI0LjQgMi42LTcuMy02LTguNi0xNi45LTIuNi0yNC40em02MjMuOSA0NzEuMmMtNzMuNCAxMDMuMy0xOTIuNyAxNjQuOS0zMTkuMyAxNjQuOC05LjYgMC0xNy40LTcuOC0xNy4zLTE3LjMgMC05LjYgNy43LTE3LjQgMTcuMy0xNy40IDExNS40IDAuMSAyMjQuMi01NiAyOTEuMS0xNTAuMSA1LjYtNy45IDE2LjMtOS43IDI0LjItNC4yIDcuNyA1LjYgOS41IDE2LjMgNCAyNC4yeiIvPgo8L3N2Zz4="; 
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: MoonGateEmbed | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.Loadable;

    constructor() {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
    }

    get publicKey() {
        return this._publicKey;
    }

    get connecting() {
        return this._connecting;
    }

    get connected() {
        return !!this._publicKey;
    }

    get readyState() {
        return this._readyState;
    }

    async connect(): Promise<void> {
        if (this._wallet) {
            throw new WalletConnectionError('Already connected');
        }
    
        this._connecting = true;
    
        try {
            this._wallet = new MoonGateEmbed();
                const publicKeyData: string = await this._wallet.sendCommand<string>('login', {
                host: window.location.origin,
            });
    
            if (publicKeyData) {
                let publicKey = new PublicKey(publicKeyData);
                this._publicKey = publicKey;
                this.emit('connect', publicKey);
            } else {
                throw new WalletPublicKeyError("No response from MoonGate wallet.");
            }
    
        } catch (error) {
            console.error('Error encountered during connection:', error);
            throw new WalletConnectionError((error as Error).message);
        } finally {
            this._connecting = false;
            console.log('Connected:', this._publicKey?.toString());
        }
    }
    

    async disconnect(): Promise<void> {
        // This function will handle the disconnection (or "logout") process.
        try {
        await this._wallet?.disconnect();
        this._wallet = null;
        this._publicKey = null;
        // before disconnecting, we need to remove the iFrame from the DOM
        this.emit('disconnect');
        } catch (error) {
            console.error('Error encountered during disconnection:', error);
            throw new WalletDisconnectionError((error as Error).message);
        }
    }

    async sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        let signature: TransactionSignature;
        if (!this._wallet) {
            throw new WalletNotConnectedError();
        }
        try {
            const signedTx = await this.signTransaction(transaction);
            signature = await connection.sendRawTransaction(signedTx.serialize(), options);
            return signature;
        } catch (error) {
            console.error('Error encountered during transaction submission:', error);
            throw new WalletSendTransactionError((error as Error).message);
        }

    }

    async signTransaction<T extends Transaction>(transaction: T): Promise<T> {

        if (!this._wallet) {
            throw new WalletNotConnectedError();
        }
        try {
            const data = transaction.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64');
            const signedTransaction: any = await this._wallet.sendCommand<string>('signTransaction', {
                transaction: data,
                host: window.location.origin,
            });
            const finalTransaction = Transaction.from(Uint8Array.from(signedTransaction)) as T;
            return finalTransaction;
        } catch (error) {
            console.error('Error encountered during transaction signing:', error);
            throw new WalletSignTransactionError((error as Error).message);
        }
}

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        if (!this._wallet) {
            throw new WalletNotConnectedError();
        }
        try {
            const signedMessage: any = await this._wallet.sendCommand<string>('signMessage', {
                host: window.location.origin,
                message: message,
            });
            const Uint8ArraySignedMessage = Uint8Array.from(signedMessage);
            return Uint8ArraySignedMessage;
        } catch (error) {
            console.error('Error encountered during message signature:', error);
            throw new WalletSignMessageError((error as Error).message);
        }
    }
}