import type { WalletName } from '@solana/wallet-adapter-base'
import {
  BaseMessageSignerWalletAdapter,
  scopePollingDetectionStrategy,
  WalletAccountError,
  WalletDisconnectionError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletPublicKeyError,
  WalletReadyState,
  WalletSignTransactionError,
} from '@solana/wallet-adapter-base'
import type { Transaction } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'

interface CompanionWallet {
  isCompanion?: boolean
  disconnect(): Promise<void>
  getAccount(): Promise<string>
  signTransaction(transaction: Transaction): Promise<FlutterSignature>
  signAllTransactions(transactions: Transaction[]): Promise<FlutterSignature[]>
  signMessage(message: Uint8Array): Promise<{ signature: number[] }>
}

interface FlutterSignature {
  signature: number[]
}

interface CompanionWindow extends Window {
  companion?: CompanionWallet
}

declare const window: CompanionWindow

export const CompanionWalletName = 'Companion' as WalletName

export class CompanionWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = CompanionWalletName
  //TODO change
  url = 'https://www.companion.to'
  icon =
    'data:image/png;base64,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'
  readonly supportedTransactionVersions = null

  private _connecting: boolean
  private _wallet: CompanionWallet | null
  private _publicKey: PublicKey | null
  private _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected

  constructor() {
    super()
    this._connecting = false
    this._wallet = null
    this._publicKey = null

    if (this._readyState !== WalletReadyState.Unsupported) {
      console.log('companion is supported!!')

      scopePollingDetectionStrategy(() => {
        if (window.companion?.isCompanion) {
          this._readyState = WalletReadyState.Installed
          this.emit('readyStateChange', this._readyState)
          return true
        }
        return false
      })
    }
  }

  get publicKey() {
    return this._publicKey
  }

  get connecting() {
    return this._connecting
  }

  get readyState() {
    return this._readyState
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return
      if (this._readyState !== WalletReadyState.Installed)
        throw new WalletNotReadyError()

      this._connecting = true

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const wallet = window.companion!

      let account: string
      try {
        account = await wallet.getAccount()
      } catch (error: any) {
        throw new WalletAccountError(error?.message, error)
      }

      let publicKey: PublicKey
      try {
        publicKey = new PublicKey(account)
      } catch (error: any) {
        throw new WalletPublicKeyError(error?.message, error)
      }

      this._wallet = wallet
      this._publicKey = publicKey

      this.emit('connect', publicKey)
    } catch (error: any) {
      this.emit('error', error)
      throw error
    } finally {
      this._connecting = false
    }
  }

  async disconnect(): Promise<void> {
    const wallet = this._wallet
    if (wallet) {
      this._wallet = null
      this._publicKey = null

      try {
        await wallet.disconnect()
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error))
      }
    }

    this.emit('disconnect')
  }

  async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
    try {
      const wallet = this._wallet
      const publicKey = this._publicKey
      if (!wallet || !publicKey) throw new WalletNotConnectedError()

      try {
        const signature = await wallet.signTransaction(transaction)

        transaction.addSignature(publicKey, Buffer.from(signature.signature))

        return transaction
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error)
      }
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }

  async signAllTransactions<T extends Transaction>(
    transactions: T[]
  ): Promise<T[]> {
    try {
      const wallet = this._wallet
      const publicKey = this._publicKey
      if (!wallet || !publicKey) throw new WalletNotConnectedError()

      try {
        const signatures = await wallet.signAllTransactions(transactions)

        for (let i = 0; i < transactions.length; i++) {
          transactions[i].addSignature(
            publicKey,
            Buffer.from(signatures[i].signature)
          )
        }

        return transactions
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error)
      }
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      const wallet = this._wallet
      if (!wallet) throw new WalletNotConnectedError()

      try {
        const { signature } = await wallet.signMessage(message)

        return new Uint8Array(signature)
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error)
      }
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }
}
