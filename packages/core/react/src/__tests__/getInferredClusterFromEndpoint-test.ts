import getInferredClusterFromEndpoint from '../getInferredClusterFromEndpoint.js';

describe('getInferredClusterFromEndpoint()', () => {
    describe('when the endpoint is `undefined`', () => {
        const rpcEndpoint = undefined;
        it('creates a new mobile wallet adapter with `mainnet-beta` as the cluster', () => {
            expect(getInferredClusterFromEndpoint(rpcEndpoint)).toBe('mainnet-beta');
        });
    });
    describe('when the endpoint is an empty string', () => {
        const rpcEndpoint = '';
        it('creates a new mobile wallet adapter with `mainnet-beta` as the cluster', () => {
            expect(getInferredClusterFromEndpoint(rpcEndpoint)).toBe('mainnet-beta');
        });
    });
    describe("when the endpoint contains the word 'devnet'", () => {
        const rpcEndpoint = 'https://foo-devnet.com';
        it('creates a new mobile wallet adapter with `devnet` as the cluster', () => {
            expect(getInferredClusterFromEndpoint(rpcEndpoint)).toBe('devnet');
        });
    });
    describe("when the endpoint contains the word 'testnet'", () => {
        const rpcEndpoint = 'https://foo-testnet.com';
        it('creates a new mobile wallet adapter with `testnet` as the cluster', () => {
            expect(getInferredClusterFromEndpoint(rpcEndpoint)).toBe('testnet');
        });
    });
    describe("when the endpoint contains the word 'mainnet-beta'", () => {
        const rpcEndpoint = 'https://foo-mainnet-beta.com';
        it('creates a new mobile wallet adapter with `mainnet-beta` as the cluster', () => {
            expect(getInferredClusterFromEndpoint(rpcEndpoint)).toBe('mainnet-beta');
        });
    });
});
