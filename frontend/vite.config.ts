import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [tailwindcss()],
    server: {
        proxy: {
            '/api': {
                target: process.env.VITE_BACKEND_URL ?? 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
});
