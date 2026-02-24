import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        strictPort: true, //si el 3000 esta ocupado, dará error y no intentará otro puerto
    }
});
