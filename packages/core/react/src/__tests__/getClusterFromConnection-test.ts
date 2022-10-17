import { Connection } from '@solana/web3.js';
import getClusterFromConnection from '../getClusterFromConnection.js';

describe('getClusterFromEndpoint()', () => {
    describe('when the connection endpoint is `undefined`', () => {
        const connection = undefined;
        it('returns `mainnet-beta` as the cluster', () => {
            expect(getClusterFromConnection(connection)).toBe('mainnet-beta');
        });
    });
    describe('when the connection endpoint is an empty string', () => {
        const connection = new Connection('');
        it('returns `mainnet-beta` as the cluster', () => {
            expect(getClusterFromConnection(connection)).toBe('mainnet-beta');
        });
    });
    describe("when the connection endpoint contains the word 'devnet'", () => {
        const connection = new Connection('https://foo-devnet.com');
        it('returns `devnet` as the cluster', () => {
            expect(getClusterFromConnection(connection)).toBe('devnet');
        });
    });
    describe("when the connection endpoint contains the word 'testnet'", () => {
        const connection = new Connection('https://foo-testnet.com');
        it('returns `testnet` as the cluster', () => {
            expect(getClusterFromConnection(connection)).toBe('testnet');
        });
    });
    describe("when the connection endpoint contains the word 'mainnet-beta'", () => {
        const connection = new Connection('https://foo-mainnet-beta.com');
        it('returns `mainnet-beta` as the cluster', () => {
            expect(getClusterFromConnection(connection)).toBe('mainnet-beta');
        });
    });
    describe("when the connection endpoint contains the word 'localhost'", () => {
        const connection = new Connection('http://localhost:8899');
        it('returns `mainnet-beta` as the cluster', () => {
            expect(getClusterFromConnection(connection)).toBe('mainnet-beta');
        });
    });
    describe('when the connection cluster is `devnet`', () => {
        // HACK: change when https://github.com/solana-labs/solana/pull/28435 lands
        const connection = new Connection('https://foo-mainnet.com');
        (connection as any).cluster = 'devnet';
        it('returns `devnet` as the cluster', () => {
            expect(getClusterFromConnection(connection)).toBe('devnet');
        });
    });
});
