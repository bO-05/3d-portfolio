import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        visualizer({
            open: false,
            filename: 'dist/bundle-analysis.html',
            gzipSize: true,
            brotliSize: true,
        }),
        compression({
            algorithm: 'gzip',
            ext: '.gz',
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'three-core': ['three'],
                    'three-r3f': ['@react-three/fiber', '@react-three/drei'],
                    'physics': ['@react-three/cannon'],
                    'analytics': ['posthog-js', '@sentry/react'],
                    'audio': ['howler'],
                },
            },
        },
        target: 'esnext',
        minify: 'esbuild',
        sourcemap: true,
    },
    server: {
        port: 5173,
        open: true,
    },
});
