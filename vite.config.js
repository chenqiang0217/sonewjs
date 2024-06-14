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
                target: 'http://127.0.0.1:8000',
                // target: 'http://sonew.xyz',
                changeOrigin: true,
                // rewrite: (path) => path.replace(/^\/api/, ''),
            },
            '/editor': {
                target: 'http://localhost:8888/editor.html',
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        },
    },
})
