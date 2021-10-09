import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: 'lib',
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'vue-ui',
            formats: ['es'],
            fileName: () => 'index.js',
        },
        rollupOptions: {
            external: [
                '@solana/wallet-adapter-base',
                '@solana/wallet-adapter-vue',
                '@solana/wallet-adapter-wallets',
                'vue',
            ],
            output: {
                globals: {
                    vue: 'Vue',
                },
            },
        },
    },
    plugins: [vue(), dts({ insertTypesEntry: true })],
})
