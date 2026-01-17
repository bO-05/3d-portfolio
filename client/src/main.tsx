/**
 * Main entry point for Jakarta Street Portfolio
 * Initializes analytics and renders the app
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initPostHog, trackEvent } from './lib/posthog';
import { initSentry, SentryErrorBoundary } from './lib/sentry';
import { useGameStore } from './stores/gameStore';
import './index.css';

// Initialize analytics and error tracking
initPostHog();
initSentry();

// Track page load
trackEvent('scene_loaded');

// Detect mobile and track session
if (window.innerWidth < 768) {
    trackEvent('mobile_session_started');
}

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

// Render the app with error boundary
createRoot(rootElement).render(
    <StrictMode>
        <SentryErrorBoundary
            fallback={({ error }) => (
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
                        {(error as Error)?.message}
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
            )}
        >
            <App />
        </SentryErrorBoundary>
    </StrictMode>
);
