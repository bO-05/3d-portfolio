/**
 * WebGL Error Boundary - Catches WebGL-related errors and shows fallback UI
 * @module components/UI/WebGLErrorBoundary
 */

import { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class WebGLErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error('[WebGLErrorBoundary] 3D rendering error:', error);
        console.error('[WebGLErrorBoundary] Component stack:', errorInfo.componentStack);
    }

    handleRetry = (): void => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={styles.container}>
                    <div style={styles.content}>
                        <div style={styles.iconContainer}>
                            <span style={styles.icon}>🎮</span>
                        </div>
                        
                        <h1 style={styles.title}>Jakarta Street Portfolio</h1>
                        <p style={styles.errorMessage}>3D experience couldn't load</p>
                        
                        <div style={styles.suggestions}>
                            <p style={styles.suggestionTitle}>Try these solutions:</p>
                            <ul style={styles.suggestionList}>
                                <li style={styles.suggestionItem}>🔄 Try refreshing the page</li>
                                <li style={styles.suggestionItem}>🌐 Use a different browser (Chrome, Firefox, Edge)</li>
                                <li style={styles.suggestionItem}>🖥️ Check if WebGL is enabled in your browser</li>
                            </ul>
                        </div>

                        <div style={styles.actions}>
                            <button style={styles.retryButton} onClick={this.handleRetry}>
                                🔄 Retry
                            </button>
                            <a
                                href="https://get.webgl.org/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={styles.webglLink}
                            >
                                Check WebGL Support →
                            </a>
                        </div>

                        {this.state.error && (
                            <details style={styles.errorDetails}>
                                <summary style={styles.errorSummary}>Technical details</summary>
                                <code style={styles.errorCode}>
                                    {this.state.error.message}
                                </code>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    },
    content: {
        textAlign: 'center',
        color: '#fff',
        padding: '2rem',
        maxWidth: '450px',
    },
    iconContainer: {
        marginBottom: '1rem',
    },
    icon: {
        fontSize: '4rem',
        filter: 'grayscale(50%)',
    },
    title: {
        fontSize: '1.75rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
        background: 'linear-gradient(90deg, #f39c12, #e74c3c)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    errorMessage: {
        fontSize: '1.125rem',
        color: '#888',
        marginBottom: '2rem',
    },
    suggestions: {
        textAlign: 'left',
        marginBottom: '2rem',
        padding: '1rem 1.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    suggestionTitle: {
        fontSize: '0.875rem',
        color: '#aaa',
        marginBottom: '0.75rem',
        fontWeight: 600,
    },
    suggestionList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    suggestionItem: {
        fontSize: '0.875rem',
        color: '#ccc',
        padding: '0.5rem 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    },
    actions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center',
    },
    retryButton: {
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        fontWeight: 600,
        color: '#fff',
        background: 'linear-gradient(90deg, #f39c12, #e74c3c)',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    webglLink: {
        fontSize: '0.875rem',
        color: '#f39c12',
        textDecoration: 'none',
    },
    errorDetails: {
        marginTop: '2rem',
        textAlign: 'left',
    },
    errorSummary: {
        fontSize: '0.75rem',
        color: '#666',
        cursor: 'pointer',
        marginBottom: '0.5rem',
    },
    errorCode: {
        display: 'block',
        fontSize: '0.75rem',
        color: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        padding: '0.75rem',
        borderRadius: '6px',
        wordBreak: 'break-word',
        fontFamily: 'monospace',
    },
};

export default WebGLErrorBoundary;
