import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        strictPort: true,
        proxy: {
            // Todas las peticiones a /auth, /sessions, /users se redirigen al back-end
            '/auth': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            '/sessions': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            '/users': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            '/cms': {
                target: 'http://localhost:8000',
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
