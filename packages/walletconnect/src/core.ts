import {
  PublicKey,
  SystemProgram,
  Transaction,
  Connection,
  Account,
} from '@solana/web3.js';
import WalletConnectClient from '@walletconnect/client';
import { AppMetadata, SessionTypes } from '@walletconnect/types';
import * as R from 'ramda';
import * as nacl from 'tweetnacl';

export type TransactionRequest = {
  fromPubkey: string;
  toPubkey: string;
  lamports: number;
};

export interface SolanaWalletConnectEventPayload {
  jsonrpc: string;
  id: number;
  method: string;
  params: any;
}

export enum SolanaRPCMethodType {
  SOL_SIGN_TRANSACTION = 'sol_signTransaction',
}

export enum SolanaWalletConnectEvent {
  REQUEST_SIGN_TRANSACTION = 'request_sign_transaction',
  PAIRING_PROPOSAL = 'pairing_proposal',
}

export enum ChainIdType {
  SOL1 = 'sol:1',
}

export type PairResult = {
  session: any;
  publicKey: string;
};
export interface SignTransactionPayload {
  transactionRequest: TransactionRequest;
  topic: string;
  request: SolanaWalletConnectEventPayload;
}

/**
 * Use the Solana web3 library to create and sign a new Transaction, returning a serialized version of the transaction
 * ready to be sent to the blockchain by the requester
 * @param {Account} account
 * @param {TransactionRequest} transactionRequest
 * @param {Connection} connection
 * @returns {Promise<Buffer>}
 */
export const signTransaction = async (
  account: Account,
  transactionRequest: TransactionRequest,
  connection: Connection,
): Promise<Buffer> => {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: account.publicKey,
      toPubkey: new PublicKey(transactionRequest.toPubkey),
      lamports: transactionRequest.lamports,
    }),
  );
  transaction.setSigners(
    // fee payed by the wallet owner
    account.publicKey,
  );
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash('max')
  ).blockhash;
  transaction.partialSign(account); // necessary to set fee payer before serializing
  const signData = transaction.serializeMessage();
  const signers = [
    { publicKey: account.publicKey, secretKey: account.secretKey },
  ];
  signers.forEach(signer => {
    const signature = Buffer.from(
      nacl.sign.detached(signData, signer.secretKey),
    );
    transaction.addSignature(signer.publicKey, signature);
  });
  return transaction.serialize();
};

export const defaultChainIds = [ChainIdType.SOL1];
export const defaultJsonRpcMethods = [SolanaRPCMethodType.SOL_SIGN_TRANSACTION];

/**
 * Attempts to connect and create a paired wallet connect session
 * @param {WalletConnectClient} client
 * @param {AppMetadata} metadata
 * @param {string[]} [chains]
 * @param {string[]} [methods]
 * @returns {Promise<PairResult>}
 */
export const waitForPairing = async (
  client: WalletConnectClient,
  metadata: AppMetadata,
  chains?: string[],
  methods?: string[],
): Promise<PairResult> => {
  const session = await client.connect({
    metadata,
    permissions: {
      blockchain: {
        chains:
          chains && R.type(chains) === 'Array'
            ? (chains as string[])
            : defaultChainIds,
      },
      jsonrpc: {
        methods:
          methods && R.type(methods) === 'Array'
            ? (methods as string[])
            : defaultJsonRpcMethods,
      },
    },
  });

  if (session.state.accounts.length === 0) {
    throw new Error(
      'Unable to establish wallet connect session. No public key returned',
    );
  }

  const connectedAccount = session.state.accounts[0];
  const address = R.pipe(R.split('@'), R.head)(connectedAccount);
  if (!address) {
    throw new Error(
      `Unable to extract public key from returned account ${connectedAccount}`,
    );
  }

  return {
    publicKey: address as string,
    session: session,
  };
};

/**
 * Calls wallet-connect to approve a pairing proposal
 *
 * @param {WalletConnectClient} client
 * @param {SessionTypes.Proposal} proposal - proposal from incoming wallet connect event
 * @param {AppMetadata} metadata - signer metadata to add to response
 * @param {string} publicKey - signer publicKey
 * @param {ChainIdType=ChainIdType.SOL1} chainId - chainId string that gets appended to account
 * @returns {Promise<SessionTypes.Settled>}
 */
export const approvePairing = async (
  client: WalletConnectClient,
  proposal: SessionTypes.Proposal,
  metadata: AppMetadata,
  publicKey: string,
  chainId: ChainIdType = ChainIdType.SOL1,
): Promise<SessionTypes.Settled> => {
  const response: SessionTypes.Response = {
    metadata,
    state: {
      accounts: [`${publicKey}@${chainId}`],
    },
  };
  return client.approve({ proposal, response });
};
