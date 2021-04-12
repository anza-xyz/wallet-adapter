import WalletConnectClient, { CLIENT_EVENTS } from '@walletconnect/client';
import {
  ChainIdType,
  SolanaWalletConnect,
  SolanaWalletConnectRequester,
  SolanaWalletConnectSigner,
} from '../../src';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import * as core from '../../src/core';
import { SolanaRPCMethodType, SolanaWalletConnectEvent } from '../../src/core';
import {
  getTestSolanaAccount,
  seed1,
  testMetaData,
  testSignerMetaData,
} from '../testSupport';
import { SessionTypes, ClientTypes } from '@walletconnect/types';
import EventEmitter from 'eventemitter3';
import { clusterApiUrl, Connection } from '@solana/web3.js';

const transactionRequest: core.TransactionRequest = {
  fromPubkey: 'test_fromPubkey',
  toPubkey: 'test_toPubkey',
  lamports: 1000,
};

class DummyEmitter extends EventEmitter {
  controller: boolean;
}
const { expect } = chai;
chai.use(sinonChai);
chai.use(chaiAsPromised);
const sandbox = sinon.createSandbox();

const account1 = getTestSolanaAccount(seed1);
describe('SolanaWalletConnectProvider', () => {
  afterEach(sandbox.restore);
  context('SolanaWalletConnect', () => {
    let dummyClient;
    let solanaWalletConnect;
    context('get client', () => {
      it('should throw an error if client is called before init', () => {
        solanaWalletConnect = new SolanaWalletConnect();
        return expect(() => solanaWalletConnect.client).to.throw(
          'SolanaWalletConnect not initialised correctly',
        );
      });

      it('should return the provided client', () => {
        dummyClient = { test: 'client' };
        solanaWalletConnect = new SolanaWalletConnect();
        solanaWalletConnect.init(dummyClient);
        expect(solanaWalletConnect.client).to.deep.eq(dummyClient);
      });
    });
  });

  context('SolanaWalletConnectRequester', () => {
    context('proposePairing', () => {
      let walletConnectRequester: SolanaWalletConnectRequester;
      let dummyClient;
      let pairSpy;
      beforeEach(() => {
        dummyClient = {};
        walletConnectRequester = new SolanaWalletConnectRequester();
        walletConnectRequester.init(dummyClient as WalletConnectClient);
        pairSpy = sandbox.stub(core, 'waitForPairing').resolves({});
      });
      it('should call the core pair function with the instance client and provided params', async () => {
        await walletConnectRequester.proposePairing(testMetaData);
        expect(pairSpy).calledWith(dummyClient, testMetaData);
      });
    });

    context('requestSignTransaction', () => {
      let walletConnectRequester;
      let dummyClient;
      beforeEach(() => {
        dummyClient = {
          request: (): Promise<Buffer> =>
            Promise.resolve(Buffer.from('test_serializedTransaction')),
        };
        walletConnectRequester = new SolanaWalletConnectRequester();
        walletConnectRequester.init(dummyClient as WalletConnectClient);
      });
      it('should call the wallet connect client request with the passed parameters', async () => {
        const topic = 'test_topic';
        const requestSpy = sandbox.spy(dummyClient, 'request');
        await walletConnectRequester.requestSignTransaction(
          topic,
          transactionRequest,
        );
        expect(requestSpy).calledWith({
          topic,
          chainId: ChainIdType.SOL1,
          request: {
            method: SolanaRPCMethodType.SOL_SIGN_TRANSACTION,
            params: transactionRequest,
          },
        });
      });
    });
  });

  context('SolanaWalletConnectSigner', () => {
    let walletConnectSigner: SolanaWalletConnectSigner;
    let walletConnectClient;
    beforeEach(async () => {
      walletConnectClient = new DummyEmitter();
      walletConnectClient.controller = true;
    });

    context('get connection', () => {
      it('should throw an error if connection is called before init', () => {
        walletConnectSigner = new SolanaWalletConnectSigner();
        return expect(() => walletConnectSigner.connection).to.throw(
          'SolanaWalletConnect not initialised correctly',
        );
      });
    });

    context('get account', () => {
      it('should throw an error if account is called before init', () => {
        walletConnectSigner = new SolanaWalletConnectSigner();
        return expect(() => walletConnectSigner.account).to.throw(
          'SolanaWalletConnect not initialised correctly',
        );
      });
    });

    context('init', () => {
      let connection;
      let testSession;
      beforeEach(async () => {
        testSession = {
          peer: {
            metadata: testMetaData,
          },
        };
        connection = new Connection(clusterApiUrl('devnet'));
        walletConnectClient = new DummyEmitter();
        walletConnectClient.controller = true;
        walletConnectClient.session = {
          get: () => testSession,
        };
        walletConnectSigner = new SolanaWalletConnectSigner();
        walletConnectSigner.init(
          walletConnectClient,
          account1.secretKey,
          connection,
        );
      });

      it('should throw an error if client.controller is not true', () => {
        walletConnectSigner = new SolanaWalletConnectSigner();
        walletConnectClient.controller = false;
        return expect(() =>
          walletConnectSigner.init(walletConnectClient),
        ).to.throw('Signing client must be controller');
      });

      it('should throw an error if no secretKey was provided on init', () => {
        walletConnectSigner = new SolanaWalletConnectSigner();
        return expect(() =>
          walletConnectSigner.init(walletConnectClient, null),
        ).to.throw('Secret key must be provided');
      });

      it('should throw an error if no connection was provided on init', () => {
        walletConnectSigner = new SolanaWalletConnectSigner();
        return expect(() =>
          walletConnectSigner.init(walletConnectClient, account1.secretKey),
        ).to.throw('Connection must be provided');
      });
      it('should listen and emit an event for SessionTypes.Proposal', () => {
        const emitSpy = sandbox.spy(walletConnectSigner, 'emit');
        const testProposal: SessionTypes.Proposal = ({
          test: 'proposal',
        } as unknown) as SessionTypes.Proposal;
        walletConnectClient.emit(CLIENT_EVENTS.session.proposal, testProposal);
        expect(emitSpy).calledWith(
          core.SolanaWalletConnectEvent.PAIRING_PROPOSAL,
          testProposal,
        );
      });

      it('should listen and emit an event for ClientTypes.RequestParams', async () => {
        const emitSpy = sandbox.spy(walletConnectSigner, 'emit');
        const topic = 'test_topic';
        const testRequest: ClientTypes.RequestParams = {
          topic,
          request: {
            method: SolanaRPCMethodType.SOL_SIGN_TRANSACTION,
            params: transactionRequest,
          },
        };
        await walletConnectClient.emit(
          CLIENT_EVENTS.session.request,
          testRequest,
        );
        return expect(emitSpy).calledWith(
          SolanaWalletConnectEvent.REQUEST_SIGN_TRANSACTION,
          {
            transactionRequest,
            topic,
            request: testRequest.request,
          },
        );
      });

      it('should listen but not emit an event for non-SolanaWalletConnectEvent method', async () => {
        const emitSpy = sandbox.spy(walletConnectSigner, 'emit');
        const topic = 'test_topic';
        const testRequest: ClientTypes.RequestParams = {
          topic,
          request: {
            method: 'non-supported method',
            params: transactionRequest,
          },
        };
        await walletConnectClient.emit(
          CLIENT_EVENTS.session.request,
          testRequest,
        );
        return expect(emitSpy.callCount).to.eq(0);
      });
    });

    context('signTransaction', () => {
      let connection;
      let topic;
      let request;
      let signTransactionStub;
      beforeEach(async () => {
        topic = 'test_topic';
        request = {
          method: SolanaRPCMethodType.SOL_SIGN_TRANSACTION,
          params: transactionRequest,
        };
        signTransactionStub = sandbox
          .stub(core, 'signTransaction')
          .resolves('serializedTransaction');
        connection = new Connection(clusterApiUrl('devnet'));
        walletConnectClient = new DummyEmitter();
        walletConnectClient.controller = true;
        walletConnectClient.respond = async () => Promise.resolve({});
        walletConnectSigner = new SolanaWalletConnectSigner();
        walletConnectSigner.init(
          walletConnectClient,
          account1.secretKey,
          connection,
        );
      });
      it('should call signTransaction with instance account and connection', async () => {
        await walletConnectSigner.signTransaction(
          transactionRequest,
          topic,
          request,
        );
        expect(signTransactionStub).calledWith(
          account1,
          transactionRequest,
          connection,
        );
      });

      it('should send a transaction response to the wallet connect client', async () => {
        const respondSpy = sandbox
          .stub(walletConnectClient, 'respond')
          .resolves({});
        await walletConnectSigner.signTransaction(
          transactionRequest,
          topic,
          request,
        );
        expect(respondSpy).calledWith({
          topic,
          response: {
            id: request.id,
            jsonrpc: request.jsonrpc,
            result: 'serializedTransaction',
          },
        });
      });

      it('should return the signed transaction', async () => {
        sandbox.stub(walletConnectClient, 'respond').resolves({});
        const signTransactionResponse = await walletConnectSigner.signTransaction(
          transactionRequest,
          topic,
          request,
        );
        expect(signTransactionResponse).to.eq('serializedTransaction');
      });
    });

    context('approvePairing', () => {
      let connection;
      beforeEach(async () => {
        connection = new Connection(clusterApiUrl('devnet'));
        walletConnectClient = new DummyEmitter();
        walletConnectClient.controller = true;
        walletConnectSigner = new SolanaWalletConnectSigner();
        walletConnectSigner.init(
          walletConnectClient,
          account1.secretKey,
          connection,
        );
      });
      it('should call the core approvePairing function with client and publicKey', async () => {
        const testProposal = { test: 'proposal' };
        const approvePairingSpy = sandbox
          .stub(core, 'approvePairing')
          .resolves({});
        await walletConnectSigner.approvePairing(
          (testProposal as unknown) as SessionTypes.Proposal,
          testSignerMetaData,
        );
        expect(approvePairingSpy).calledWith(
          walletConnectClient,
          testProposal,
          testSignerMetaData,
          account1.publicKey.toBase58(),
        );
      });
    });
  });
});
