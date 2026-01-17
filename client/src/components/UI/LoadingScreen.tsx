/**
 * Loading screen component displayed while assets load
 * @module components/UI/LoadingScreen
 */

import { memo } from 'react';
import { useProgress } from '@react-three/drei';
import { useGameStore } from '../../stores/gameStore';
import { trackAssetsLoaded } from '../../lib/analytics';
import { useEffect, useRef } from 'react';

/**
 * Loading screen that displays asset loading progress
 * Automatically hides when loading completes
 */
export const LoadingScreen = memo(function LoadingScreen() {
    const { progress, loaded, total } = useProgress();
    const setLoading = useGameStore((state) => state.setLoading);
    const loadStartRef = useRef(performance.now());

    useEffect(() => {
        // Handle case where there are no assets to load (total === 0)
        // or when all assets are loaded (progress === 100)
        const isComplete = progress === 100 || (total === 0 && loaded === 0);

        if (isComplete) {
            const loadTime = performance.now() - loadStartRef.current;
            trackAssetsLoaded(loadTime, total);

            // Small delay for smoother transition
            const timer = setTimeout(() => {
                setLoading(false);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [progress, setLoading, total, loaded]);

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <h1 style={styles.title}>🚗 Jakarta Street Portfolio</h1>
                <p style={styles.subtitle}>Loading the streets of Jakarta...</p>

                <div style={styles.progressContainer}>
                    <div style={styles.progressBar}>
                        <div
                            style={{
                                ...styles.progressFill,
                                width: `${progress}%`,
                            }}
                        />
                    </div>
                    <span style={styles.progressText}>
                        {Math.round(progress)}% ({loaded}/{total})
                    </span>
                </div>

                <div style={styles.tips}>
                    <p>💡 Use WASD or Arrow keys to drive</p>
                    <p>🖱️ Click on buildings to explore</p>
                </div>
            </div>
        </div>
    );
});

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
        maxWidth: '400px',
    },
    title: {
        fontSize: '2rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
        background: 'linear-gradient(90deg, #f39c12, #e74c3c)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: {
        fontSize: '1rem',
        color: '#888',
        marginBottom: '2rem',
    },
    progressContainer: {
        marginBottom: '2rem',
    },
    progressBar: {
        width: '100%',
        height: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '0.5rem',
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #f39c12, #e74c3c)',
        borderRadius: '4px',
        transition: 'width 0.3s ease',
    },
    progressText: {
        fontSize: '0.875rem',
        color: '#888',
    },
    tips: {
        fontSize: '0.875rem',
        color: '#666',
        lineHeight: 1.8,
    },
};
