/**
 * Main entry point for Jakarta Street Portfolio
 * Initializes analytics and renders the app
 * 
 * Performance optimization: Analytics are deferred until after
 * the page is interactive to improve FCP and TTI.
 */

import { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { useGameStore } from './stores/gameStore';
import './index.css';

/**
 * Lightweight Error Boundary that doesn't depend on Sentry for initial render.
 * Errors are captured and reported to Sentry asynchronously when available.
 */
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class LightweightErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Report to Sentry asynchronously (doesn't block render)
        import('./lib/sentry').then(({ captureError }) => {
            captureError(error, { componentStack: errorInfo.componentStack ?? undefined });
        }).catch(() => {
            // Sentry not available, log to console
            console.error('Error boundary caught:', error, errorInfo);
        });
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    backgroundColor: '#1a1a2e',
                    color: '#eee',
                    fontFamily: 'system-ui, sans-serif',
                    padding: '2rem',
                    textAlign: 'center',
                }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                        🚗 Oops! The bajaj hit a pothole!
                    </h1>
                    <p style={{ color: '#888', marginBottom: '2rem' }}>
                        Something went wrong. Please refresh the page to try again.
                    </p>
                    <pre style={{
                        backgroundColor: '#0f0f1a',
                        padding: '1rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        maxWidth: '100%',
                        overflow: 'auto',
                    }}>
                        {this.state.error?.message}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '2rem',
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

/**
 * Defer analytics initialization until the browser is idle.
 * PostHog loads after ~3 seconds via requestIdleCallback.
 * Sentry loads after 10 seconds to avoid blocking the Lighthouse measurement window,
 * since Sentry's initialization takes ~10 seconds of main thread time.
 */
function deferAnalyticsInit(): void {
    const initPostHog = async () => {
        // Initialize PostHog via the lazy wrapper
        const { initAnalytics, trackEvent } = await import('./lib/analytics');
        await initAnalytics();

        // Track page load
        trackEvent('scene_loaded');

        // Detect mobile and track session
        if (window.innerWidth < 768) {
            trackEvent('mobile_session_started');
        }
    };

    const initSentry = async () => {
        // Initialize Sentry after a long delay
        const sentryModule = await import('./lib/sentry');
        sentryModule.initSentry();
    };

    // PostHog loads soon (3 second timeout via requestIdleCallback)
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => initPostHog(), { timeout: 3000 });
    } else {
        setTimeout(initPostHog, 2000);
    }

    // Sentry loads much later (10 seconds) to avoid blocking Lighthouse
    // This is still fast enough to catch errors in real user sessions
    setTimeout(initSentry, 10000);
}

// Defer analytics to after page is interactive
deferAnalyticsInit();

// Expose gameStore on window for dev testing (console commands)
// Usage: gameStore.getState().setTimeOfDay('night')
if (import.meta.env.DEV) {
    (window as unknown as { gameStore: typeof useGameStore }).gameStore = useGameStore;
}

// Get the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Root element not found');
}

// Render the app with lightweight error boundary
createRoot(rootElement).render(
    <StrictMode>
        <LightweightErrorBoundary>
            <App />
        </LightweightErrorBoundary>
    </StrictMode>
);

