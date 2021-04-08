import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import {
  Account,
  Transaction,
  Connection,
  SystemProgram,
  clusterApiUrl,
} from '@solana/web3.js';
import * as nacl from 'tweetnacl';
import { derivePath } from 'ed25519-hd-key';
import WalletConnectClient from '@walletconnect/client';
import { AppMetadata, ClientTypes, SessionTypes } from '@walletconnect/types';

import {
  approvePairing,
  ChainIdType,
  defaultChainIds,
  defaultJsonRpcMethods,
  waitForPairing,
  signTransaction,
  TransactionRequest,
} from '../../src/core';
import {
  getTestSolanaAccount,
  seed1,
  seed2,
  testMetaData,
  testSignerMetaData,
} from '../testSupport';

const { expect } = chai;
chai.use(sinonChai);
chai.use(chaiAsPromised);
const sandbox = sinon.createSandbox();

const account1 = getTestSolanaAccount(seed1);
const account2 = getTestSolanaAccount(seed2);
describe('core unit tests', () => {
  afterEach(sandbox.restore);
  context('signTransaction', () => {
    let addSpy;
    let blockhashSpy;
    const lamports = 100000;
    let setSignersSpy;
    let addSignatureSpy;
    let serializeMessageSpy;
    let partialSignSpy;
    let signTransactionResponse;
    let serializeSpy;
    const transactionRequest: TransactionRequest = {
      fromPubkey: account1.publicKey.toBase58(),
      toPubkey: account2.publicKey.toBase58(),
      lamports,
    };
    beforeEach(async () => {
      const connection = new Connection(clusterApiUrl('devnet'));
      addSpy = sandbox.spy(Transaction.prototype, 'add');
      setSignersSpy = sandbox.spy(Transaction.prototype, 'setSigners');
      blockhashSpy = sandbox.spy(Connection.prototype, 'getRecentBlockhash');
      addSignatureSpy = sandbox.spy(Transaction.prototype, 'addSignature');
      partialSignSpy = sandbox.spy(Transaction.prototype, 'partialSign');
      serializeMessageSpy = sandbox.spy(
        Transaction.prototype,
        'serializeMessage',
      );
      serializeSpy = sandbox.spy(Transaction.prototype, 'serialize');
      signTransactionResponse = await signTransaction(
        account1,
        transactionRequest,
        connection,
      );
    });

    it('should use SystemProgram.transfer to add to the transaction', () => {
      expect(addSpy).calledWith(
        SystemProgram.transfer({
          fromPubkey: account1.publicKey,
          toPubkey: account2.publicKey,
          lamports,
        }),
      );
    });

    it('should set the signer to the provided account publicKey', () => {
      expect(setSignersSpy).calledWith(account1.publicKey);
    });

    it('should partialSign using the provided account', () => {
      expect(partialSignSpy).calledWith(account1);
    });

    it('should add a signature using the account secret key', () => {
      const signData = serializeMessageSpy.getCall(0).returnValue;
      expect(addSignatureSpy).calledWith(
        account1.publicKey,
        Buffer.from(nacl.sign.detached(signData, account1.secretKey)),
      );
    });
    it('should use the most recent blockhash', () => {
      expect(blockhashSpy).calledWith('max');
    });

    it('should return a serialized transaction', () => {
      expect(signTransactionResponse).to.be.instanceof(Buffer);
      expect(signTransactionResponse).to.deep.eq(
        serializeSpy.getCall(0).returnValue,
      );
    });
  });

  context('waitForPairing', () => {
    let dummyClient;
    let dummySession;
    const publicKey = 'test';

    beforeEach(async () => {
      dummySession = {
        state: { accounts: [`${publicKey}@testChainId`] },
      };
      dummyClient = {
        connect: (params: ClientTypes.ConnectParams) => dummySession,
      };
    });
    it('should return a publicKey and session', async () => {
      const pairResult = await waitForPairing(
        dummyClient as WalletConnectClient,
        testMetaData,
      );
      expect(pairResult).to.deep.eq({
        publicKey,
        session: dummySession,
      });
    });

    it('should throw an error if no accounts are returned in the session', () => {
      sandbox
        .stub(dummyClient, 'connect')
        .resolves({ state: { accounts: [] } });
      return expect(
        waitForPairing(dummyClient as WalletConnectClient, testMetaData),
      ).to.be.rejectedWith(
        'Unable to establish wallet connect session. No public key returned',
      );
    });

    it('should throw an error if the account address is malformed', () => {
      sandbox
        .stub(dummyClient, 'connect')
        .resolves({ state: { accounts: ['@badAddress'] } });
      return expect(
        waitForPairing(dummyClient as WalletConnectClient, testMetaData),
      ).to.be.rejectedWith(
        'Unable to extract public key from returned account @badAddress',
      );
    });

    it('should add provided metadata to connection params', async () => {
      const connectSpy = sandbox.spy(dummyClient, 'connect');
      await waitForPairing(dummyClient as WalletConnectClient, testMetaData);
      expect(connectSpy).calledWith({
        metadata: testMetaData,
        permissions: {
          blockchain: {
            chains: defaultChainIds,
          },
          jsonrpc: {
            methods: defaultJsonRpcMethods,
          },
        },
      });
    });

    it('should add provided chains to connection params', async () => {
      const testChains = ['testChain1'];
      const connectSpy = sandbox.spy(dummyClient, 'connect');
      await waitForPairing(
        dummyClient as WalletConnectClient,
        testMetaData,
        testChains,
      );
      expect(connectSpy).calledWith({
        metadata: testMetaData,
        permissions: {
          blockchain: {
            chains: testChains,
          },
          jsonrpc: {
            methods: defaultJsonRpcMethods,
          },
        },
      });
    });

    it('should add provided methods to connection params', async () => {
      const testMethods = ['method1'];
      const connectSpy = sandbox.spy(dummyClient, 'connect');
      await waitForPairing(
        dummyClient as WalletConnectClient,
        testMetaData,
        null,
        testMethods,
      );
      expect(connectSpy).calledWith({
        metadata: testMetaData,
        permissions: {
          blockchain: {
            chains: defaultChainIds,
          },
          jsonrpc: {
            methods: testMethods,
          },
        },
      });
    });
  });

  context('approvePairing', () => {
    let dummyClient;
    beforeEach(async () => {
      dummyClient = {
        approve: (
          client: WalletConnectClient,
          proposal: SessionTypes.Proposal,
          metadata: AppMetadata,
          publicKey: string,
          chainId: ChainIdType,
        ) => ({} as SessionTypes.Settled),
      };
    });
    it('should call client.approve with the correct parameters', async () => {
      const testProposal = { test: 'proposal' };

      const publicKey = 'test_publicKey';
      const approveStub = sandbox.stub(dummyClient, 'approve').resolves(true);
      await approvePairing(
        dummyClient as WalletConnectClient,
        (testProposal as unknown) as SessionTypes.Proposal,
        testSignerMetaData,
        publicKey,
      );
      expect(approveStub).calledWith({
        proposal: testProposal,
        response: {
          metadata: testSignerMetaData,
          state: {
            accounts: [`${publicKey}@${ChainIdType.SOL1}`],
          },
        },
      });
    });
  });
});
