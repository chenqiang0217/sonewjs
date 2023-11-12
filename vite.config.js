import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
    base: './',
    plugins: [vue()],
    server: {
        host: '0.0.0.0',
        port: 8888,
        proxy: {
            '/api': {
                // target: 'http://127.0.0.1:7039',
                target: 'http://sonew.xyz',
                changeOrigin: true,
                // rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        },
    },
})
