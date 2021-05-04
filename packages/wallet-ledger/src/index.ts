import type Transport from '@ledgerhq/hw-transport';
import type { Transaction } from '@solana/web3.js';

import EventEmitter from 'eventemitter3';
import { PublicKey } from '@solana/web3.js';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { WalletAdapter, WalletProvider } from '@solana/wallet-base';
import { getPublicKey, signTransaction } from './core';

export class LedgerWalletAdapter extends EventEmitter implements WalletAdapter {
  _connecting: boolean;
  _publicKey: PublicKey | null;
  _transport: Transport | null;

  constructor() {
    super();
    this._connecting = false;
    this._publicKey = null;
    this._transport = null;
  }

  get publicKey() {
    return this._publicKey;
  }

  async signTransaction(transaction: Transaction) {
    if (!this._transport || !this._publicKey) {
      throw new Error('Not connected to Ledger');
    }

    // @TODO: account selection (derivation path changes with account)
    const signature = await signTransaction(this._transport, transaction);

    transaction.addSignature(this._publicKey, signature);

    return transaction;
  }

  async signAllTransactions(transactions: Transaction[]) {
    return transactions;
  }

  async connect() {
    if (this._connecting) {
      return;
    }

    this._connecting = true;

    try {
      // @TODO: transport selection (WebUSB, WebHID, bluetooth, ...)
      this._transport = await TransportWebUSB.create();
      // @TODO: account selection
      this._publicKey = await getPublicKey(this._transport);
      this.emit('connect', this._publicKey);
    } catch (error) {
      await this.disconnect();
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect() {
    let emit = false;
    if (this._transport) {
      await this._transport.close();
      this._transport = null;
      emit = true;
    }

    this._connecting = false;
    this._publicKey = null;

    if (emit) {
      this.emit('disconnect');
    }
  }
}

const ASSETS_URL =
  'https://raw.githubusercontent.com/solana-labs/oyster/main/assets/wallets/';
export const LedgerProvider: WalletProvider = {
  name: 'Ledger',
  url: 'https://www.ledger.com',
  icon: `${ASSETS_URL}ledger.svg`,
  adapter: () => new LedgerWalletAdapter(),
};
