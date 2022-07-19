/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
    preset: 'ts-jest/presets/js-with-ts-esm',
    testEnvironment: 'node',
    globals: {
        IS_REACT_ACT_ENVIRONMENT: true,
        'ts-jest': {
            tsconfig: './tsconfig.test.json',
        },
    },
    transformIgnorePatterns: ['/node_modules\\/uuid\\//'],
};
