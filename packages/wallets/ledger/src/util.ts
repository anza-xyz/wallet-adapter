import type { default as Transport } from '@ledgerhq/hw-transport';
import { StatusCodes, TransportStatusError } from '@ledgerhq/hw-transport';
import type { Transaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import BIPPath from 'bip32-path';
import './polyfills/index.js';

const INS_GET_PUBKEY = 0x05;
const INS_SIGN_MESSAGE = 0x06;
const INS_SIGN_MESSAGE_OFFCHAIN = 0x07;

const P1_NON_CONFIRM = 0x00;
const P1_CONFIRM = 0x01;

const P2_EXTEND = 0x01;
const P2_MORE = 0x02;

const MAX_PAYLOAD = 255;

const LEDGER_CLA = 0xe0;

/** @internal */
export async function getPublicKey(transport: Transport, derivationPath: Buffer): Promise<PublicKey> {
    const bytes = await send(transport, INS_GET_PUBKEY, P1_NON_CONFIRM, derivationPath);
    return new PublicKey(bytes);
}

/** @internal */
export async function signTransaction(
    transport: Transport,
    transaction: Transaction,
    derivationPath: Buffer
): Promise<Buffer> {
    const paths = Buffer.alloc(1);
    paths.writeUInt8(1, 0);

    const message = transaction.serializeMessage();
    const data = Buffer.concat([paths, derivationPath, message]);

    return await send(transport, INS_SIGN_MESSAGE, P1_CONFIRM, data);
}

/** @internal */
export async function signMessage(transport: Transport, message: Buffer, derivationPath: Buffer): Promise<Buffer> {
    const paths = Buffer.alloc(1);
    paths.writeUInt8(1, 0);

    const data = Buffer.concat([paths, derivationPath, message]);

    return await send(transport, INS_SIGN_MESSAGE_OFFCHAIN, P1_CONFIRM, data);
}

export function pathToBuffer(originalPath: string) {
    const path = originalPath
        .split('/')
        .map((value) => (value.endsWith("'") || value.endsWith('h') ? value : `${value}'`))
        .join('/');
    const pathNums: number[] = BIPPath.fromString(path).toPathArray();
    return serializePath(pathNums);
}

function serializePath(path: number[]) {
    const buf = Buffer.alloc(1 + path.length * 4);
    buf.writeUInt8(path.length, 0);
    for (const [i, num] of path.entries()) {
        buf.writeUInt32BE(num, 1 + i * 4);
    }
    return buf;
}

async function send(transport: Transport, instruction: number, p1: number, data: Buffer): Promise<Buffer> {
    let p2 = 0;
    let offset = 0;

    if (data.length > MAX_PAYLOAD) {
        while (data.length - offset > MAX_PAYLOAD) {
            const buffer = data.slice(offset, offset + MAX_PAYLOAD);
            const response = await transport.send(LEDGER_CLA, instruction, p1, p2 | P2_MORE, buffer);
            // @ts-ignore -- TransportStatusError is a constructor Function, not a Class
            if (response.length !== 2) throw new TransportStatusError(StatusCodes.INCORRECT_DATA);

            p2 |= P2_EXTEND;
            offset += MAX_PAYLOAD;
        }
    }

    const buffer = data.slice(offset);
    const response = await transport.send(LEDGER_CLA, instruction, p1, p2, buffer);

    return response.slice(0, response.length - 2);
}
