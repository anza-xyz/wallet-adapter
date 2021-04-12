import EventEmitter from 'eventemitter3';
import { Account, Connection } from '@solana/web3.js';
import {
  approvePairing,
  ChainIdType,
  defaultChainIds,
  defaultJsonRpcMethods,
  waitForPairing,
  PairResult,
  signTransaction,
  SignTransactionPayload,
  SolanaRPCMethodType,
  SolanaWalletConnectEvent,
  SolanaWalletConnectEventPayload,
  TransactionRequest,
} from './core';
import WalletConnectClient, { CLIENT_EVENTS } from '@walletconnect/client';
import { AppMetadata, ClientTypes, SessionTypes } from '@walletconnect/types';

export {
  TransactionRequest,
  SolanaWalletConnectEvent,
  SignTransactionPayload,
  ChainIdType,
  defaultChainIds,
  defaultJsonRpcMethods,
  PairResult,
};

export interface SolanaWalletConnectInterface {
  _client: WalletConnectClient | null;

  client: WalletConnectClient;

  init(client: WalletConnectClient): void;
}
export interface SolanaWalletConnectSignerInterface
  extends SolanaWalletConnectInterface {
  _account: Account | null | undefined;
  _connection: Connection | null | undefined;

  connection: Connection;
  account: Account;

  init(
    client: WalletConnectClient,
    secretKey?: Buffer | Uint8Array | number[],
    connection?: Connection,
  ): void;
}

export interface SolanaWalletConnectRequesterInterface
  extends SolanaWalletConnectInterface {
  requestSignTransaction(
    topic: string,
    transaction: TransactionRequest,
    chainId: ChainIdType,
  ): Promise<Buffer>;
}

/**
 * Base class for requester and signer implementations
 */
export class SolanaWalletConnect
  extends EventEmitter
  implements SolanaWalletConnectInterface {
  _client: WalletConnectClient | null;

  constructor() {
    super();
    this._client = null;
  }

  get client(): WalletConnectClient {
    if (!this._client)
      throw new Error('SolanaWalletConnect not initialised correctly');
    return this._client;
  }

  public init(client: WalletConnectClient): void {
    this._client = client;
  }
}

/**
 * class for a DAPP to use to request and use a walletconnect session
 */
export class SolanaWalletConnectRequester
  extends SolanaWalletConnect
  implements SolanaWalletConnectRequesterInterface {
  /**
   * Propose and wait for a pairing session with a WalletConnect remote client
   * @param {AppMetadata} metadata
   * @param {string[]} [chains]
   * @param {string[]} [methods]
   * @returns Promise<PairResult>
   */
  public async proposePairing(
    metadata: AppMetadata,
    chains?: string[],
    methods?: string[],
  ): Promise<PairResult> {
    return waitForPairing(this.client, metadata, chains, methods);
  }

  async requestSignTransaction(
    topic: string,
    transaction: TransactionRequest,
    chainId: ChainIdType = ChainIdType.SOL1,
  ): Promise<Buffer> {
    const serializedTransaction = await this.client.request({
      topic,
      chainId,
      request: {
        method: SolanaRPCMethodType.SOL_SIGN_TRANSACTION,
        params: transaction,
      },
    });
    return serializedTransaction;
  }
}

/**
 * class for a signing device to use to respond to walletconnect requests
 */
export class SolanaWalletConnectSigner
  extends SolanaWalletConnect
  implements SolanaWalletConnectSignerInterface {
  _account: Account | null | undefined;
  _connection: Connection | null | undefined;

  constructor() {
    super();
    this._account = null;
    this._connection = null;
  }

  /**
   * Approve a pairing request through the walletconnect client
   * @param {SessionTypes.Proposal} proposal
   * @param {AppMetadata} metadata
   * @returns {Promise<SessionTypes.Settled>}
   */
  public async approvePairing(
    proposal: SessionTypes.Proposal,
    metadata: AppMetadata,
  ): Promise<SessionTypes.Settled> {
    return approvePairing(
      this.client,
      proposal,
      metadata,
      this.account.publicKey.toBase58(),
    );
  }

  get connection(): Connection {
    if (!this._connection)
      throw new Error('SolanaWalletConnect not initialised correctly');
    return this._connection;
  }

  get account(): Account {
    if (!this._account)
      throw new Error('SolanaWalletConnect not initialised correctly');
    return this._account && this._account;
  }

  /**
   * set variables required to create and sign transactions and listen for supported RPC method calls
   * @param {WalletConnectClient} client
   * @param {Buffer | Uint8Array | number[]} [secretKey]
   * @param {Connection} [connection]
   * @returns {void}
   */
  public init(
    client: WalletConnectClient,
    secretKey?: Buffer | Uint8Array | number[],
    connection?: Connection,
  ): void {
    super.init(client);

    if (!this.client.controller)
      throw new Error('Signing client must be controller');
    if (!secretKey) throw new Error('Secret key must be provided');
    if (!connection) throw new Error('Connection must be provided');

    this._account = new Account(secretKey);
    this._connection = connection;

    client.on(
      CLIENT_EVENTS.session.proposal,
      async (proposal: SessionTypes.Proposal) => {
        this.emit(SolanaWalletConnectEvent.PAIRING_PROPOSAL, proposal);
      },
    );

    client.on(
      CLIENT_EVENTS.session.request,
      async (requestParams: ClientTypes.RequestParams) => {
        // WalletConnect client can track multiple sessions
        // so we assert the topic from which the application requested signing
        const { topic } = requestParams;
        const request = <SolanaWalletConnectEventPayload>requestParams.request;
        const session = await client.session.get(requestParams.topic);

        const { metadata } = session.peer;

        const { method, params } = request;
        // we only emit events for supported methods
        if (method === SolanaRPCMethodType.SOL_SIGN_TRANSACTION) {
          const transactionRequest: TransactionRequest = params;
          this.emit(SolanaWalletConnectEvent.REQUEST_SIGN_TRANSACTION, {
            transactionRequest,
            topic,
            request,
          } as SignTransactionPayload);
        }
      },
    );
  }

  /**
   * Create, sign and return a Solana transaction request using instantiated the device secret key
   * @param {TransactionRequest} transaction
   * @param {string} topic
   * @param {SolanaWalletConnectEventPayload} request
   * @returns Promise<Buffer | null>
   */
  async signTransaction(
    transaction: TransactionRequest,
    topic: string,
    request: SolanaWalletConnectEventPayload,
  ): Promise<Buffer | null> {
    const signedTransaction = await signTransaction(
      this.account,
      transaction,
      this.connection,
    );
    const response = {
      topic,
      response: {
        id: request.id,
        jsonrpc: request.jsonrpc,
        result: signedTransaction,
      },
    };
    await this.client.respond(response);
    return signedTransaction;
  }
}
