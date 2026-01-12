import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';
import path from 'path';

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
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
                    'physics': ['@react-three/cannon'],
                    'analytics': ['posthog-js', '@sentry/react'],
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
