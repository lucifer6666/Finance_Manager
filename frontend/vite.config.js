import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    server: {
        port: 5173,
        host: '0.0.0.0',
        proxy: {
            '/api': {
                target: 'http://192.168.1.17:8000',
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api/, '/api'); }
            }
        }
    }
});
