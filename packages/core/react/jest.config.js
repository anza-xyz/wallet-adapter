import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
    preset: 'ts-jest/presets/default-esm',
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    resolver: `${__dirname}/jest.resolver.cjs`,
    globals: {
        IS_REACT_ACT_ENVIRONMENT: true,
        'ts-jest': {
            tsconfig: './tsconfig.tests.json',
        },
    },
    testEnvironment: 'node',
    transformIgnorePatterns: ['/node_modules/(?!(uuid))'],
};
