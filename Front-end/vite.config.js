import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        strictPort: true,
        proxy: {
            '/api': {
                target: 'http://localhost',
                changeOrigin: true,
            },
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    icons: ['react-icons']
                }
            }
        }
    },
    test: {
        environment: 'happy-dom',
        globals: true
    }
});
