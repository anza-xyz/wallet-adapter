import type Transport from '@ledgerhq/hw-transport';
import type { Transaction } from '@solana/web3.js';

import { PublicKey } from '@solana/web3.js';

const INS_GET_PUBKEY = 0x05;
const INS_SIGN_MESSAGE = 0x06;

const P1_NON_CONFIRM = 0x00;
const P1_CONFIRM = 0x01;

const P2_EXTEND = 0x01;
const P2_MORE = 0x02;

const MAX_PAYLOAD = 255;

const LEDGER_CLA = 0xe0;

/*
 * Helper for chunked send of large payloads
 */
async function ledgerSend(
  transport: Transport,
  instruction: number,
  p1: number,
  payload: Buffer,
) {
  let p2 = 0;
  let payloadOffset = 0;

  if (payload.length > MAX_PAYLOAD) {
    while (payload.length - payloadOffset > MAX_PAYLOAD) {
      const chunk = payload.slice(payloadOffset, payloadOffset + MAX_PAYLOAD);
      payloadOffset += MAX_PAYLOAD;
      console.log(
        'send',
        (p2 | P2_MORE).toString(16),
        chunk.length.toString(16),
        chunk,
      );
      const reply = await transport.send(
        LEDGER_CLA,
        instruction,
        p1,
        p2 | P2_MORE,
        chunk,
      );
      if (reply.length !== 2) {
        throw new Error('Received unexpected reply payload');
      }
      p2 |= P2_EXTEND;
    }
  }

  const chunk = payload.slice(payloadOffset);
  console.log('send', p2.toString(16), chunk.length.toString(16), chunk);
  const reply = await transport.send(LEDGER_CLA, instruction, p1, p2, chunk);

  return reply.slice(0, reply.length - 2);
}

const BIP32_HARDENED_BIT = (1 << 31) >>> 0;
function harden(n: number = 0) {
  return (n | BIP32_HARDENED_BIT) >>> 0;
}

export function getSolanaDerivationPath(account?: number, change?: number) {
  var length;
  if (account !== undefined) {
    if (change !== undefined) {
      length = 4;
    } else {
      length = 3;
    }
  } else {
    length = 2;
  }

  var derivationPath = Buffer.alloc(1 + length * 4);
  // eslint-disable-next-line
  var offset = 0;
  offset = derivationPath.writeUInt8(length, offset);
  offset = derivationPath.writeUInt32BE(harden(44), offset); // Using BIP44
  offset = derivationPath.writeUInt32BE(harden(501), offset); // Solana's BIP44 path

  if (length > 2) {
    offset = derivationPath.writeUInt32BE(harden(account), offset);
    if (length === 4) {
      // @FIXME: https://github.com/project-serum/spl-token-wallet/issues/59
      offset = derivationPath.writeUInt32BE(harden(change), offset);
    }
  }

  return derivationPath;
}

export async function signTransaction(
  transport: Transport,
  transaction: Transaction,
  derivationPath: Buffer = getSolanaDerivationPath(),
) {
  const messageBytes = transaction.serializeMessage();
  return signBytes(transport, messageBytes, derivationPath);
}

export async function signBytes(
  transport: Transport,
  bytes: Buffer,
  derivationPath: Buffer = getSolanaDerivationPath(),
) {
  const numPaths = Buffer.alloc(1);
  numPaths.writeUInt8(1, 0);

  const payload = Buffer.concat([numPaths, derivationPath, bytes]);

  // @FIXME: must enable blind signing in Solana Ledger App per https://github.com/project-serum/spl-token-wallet/issues/71
  // See also https://github.com/project-serum/spl-token-wallet/pull/23#issuecomment-712317053
  return ledgerSend(transport, INS_SIGN_MESSAGE, P1_CONFIRM, payload);
}

export async function getPublicKey(
  transport: Transport,
  derivationPath: Buffer = getSolanaDerivationPath(),
) {
  const publicKeyBytes = await ledgerSend(
    transport,
    INS_GET_PUBKEY,
    P1_NON_CONFIRM,
    derivationPath,
  );

  return new PublicKey(publicKeyBytes);
}
