import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import polyfillNode from 'rollup-plugin-polyfill-node';
import { main, module } from './package.json';

export default {
    input: 'src/index.ts',
    output: [
        { file: main, format: 'cjs', sourcemap: true },
        { file: module, format: 'es', sourcemap: true },
    ],
    external: [
        '@material-ui/core',
        '@material-ui/icons',
        '@solana/web3.js',
        '@solana/wallet-adapter-base',
        '@solana/wallet-adapter-react',
        'react',
    ],
    watch: {
        include: 'src/**',
    },
    plugins: [
        typescript(),
        json(),
        nodeResolve({
            browser: true,
            preferBuiltins: false,
        }),
        commonjs(),
        polyfillNode(),
    ],
};
