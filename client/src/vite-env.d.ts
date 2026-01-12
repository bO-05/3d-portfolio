/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_POSTHOG_API_KEY: string;
    readonly VITE_POSTHOG_HOST: string;
    readonly VITE_SENTRY_DSN: string;
    readonly VITE_API_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
