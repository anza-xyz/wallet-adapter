import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        target: 'es2019',
        outDir: 'lib/esm',
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'vue-ui',
            formats: ['es'],
            fileName: () => 'index.mjs',
        },
        rollupOptions: {
            external: ['@solana/wallet-adapter-base', '@solana/wallet-adapter-vue', 'vue'],
            output: {
                globals: {
                    vue: 'Vue',
                },
            },
        },
        sourcemap: true,
        minify: false,
    },
    plugins: [vue(), dts({ tsConfigFilePath: 'tsconfig.json' })],
});
