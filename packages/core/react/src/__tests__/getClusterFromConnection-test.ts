import { Connection } from '@solana/web3.js';
import getClusterFromConnection from '../getClusterFromConnection.js';

describe('getClusterFromConnection()', () => {
    describe('when the connection is `undefined`', () => {
        const connection = undefined;
        it('creates a new mobile wallet adapter with `mainnet-beta` as the cluster', () => {
            expect(getClusterFromConnection(connection)).toBe('mainnet-beta');
        });
    });
    describe("when the endpoint contains the word 'devnet'", () => {
        const connection = new Connection('https://foo-devnet.com');
        it('creates a new mobile wallet adapter with `devnet` as the cluster', () => {
            expect(getClusterFromConnection(connection)).toBe('devnet');
        });
    });
    describe("when the endpoint contains the word 'testnet'", () => {
        const connection = new Connection('https://foo-testnet.com');
        it('creates a new mobile wallet adapter with `testnet` as the cluster', () => {
            expect(getClusterFromConnection(connection)).toBe('testnet');
        });
    });
    describe("when the endpoint contains the word 'mainnet-beta'", () => {
        const connection = new Connection('https://foo-mainnet-beta.com');
        it('creates a new mobile wallet adapter with `mainnet-beta` as the cluster', () => {
            expect(getClusterFromConnection(connection)).toBe('mainnet-beta');
        });
    });
});
