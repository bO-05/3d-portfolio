/**
 * Mobile Touch Controls Component
 * D-pad for vehicle control on mobile devices
 * @module components/UI/MobileControls
 */

import { memo, useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import './MobileControls.css';

/**
 * Simulate keyboard events for vehicle control
 */
function simulateKey(key: string, type: 'keydown' | 'keyup') {
    window.dispatchEvent(new KeyboardEvent(type, { key, code: key }));
}

/**
 * Mobile-only touch controls for vehicle movement
 */
export const MobileControls = memo(function MobileControls() {
    const showMobileControls = useGameStore((state) => state.ui.showMobileControls);
    const activeKeys = useRef<Set<string>>(new Set());

    // Handle touch start
    const handleTouchStart = useCallback((key: string) => {
        if (!activeKeys.current.has(key)) {
            activeKeys.current.add(key);
            simulateKey(key, 'keydown');
        }
    }, []);

    // Handle touch end
    const handleTouchEnd = useCallback((key: string) => {
        if (activeKeys.current.has(key)) {
            activeKeys.current.delete(key);
            simulateKey(key, 'keyup');
        }
    }, []);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            activeKeys.current.forEach((key) => {
                simulateKey(key, 'keyup');
            });
        };
    }, []);

    if (!showMobileControls) return null;

    return (
        <div className="mobile-controls">
            {/* D-pad */}
            <div className="dpad">
                <button
                    className="dpad-btn dpad-up"
                    onTouchStart={() => handleTouchStart('ArrowUp')}
                    onTouchEnd={() => handleTouchEnd('ArrowUp')}
                    onMouseDown={() => handleTouchStart('ArrowUp')}
                    onMouseUp={() => handleTouchEnd('ArrowUp')}
                    onMouseLeave={() => handleTouchEnd('ArrowUp')}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    ▲
                </button>
                <div className="dpad-row">
                    <button
                        className="dpad-btn dpad-left"
                        onTouchStart={() => handleTouchStart('ArrowLeft')}
                        onTouchEnd={() => handleTouchEnd('ArrowLeft')}
                        onMouseDown={() => handleTouchStart('ArrowLeft')}
                        onMouseUp={() => handleTouchEnd('ArrowLeft')}
                        onMouseLeave={() => handleTouchEnd('ArrowLeft')}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        ◀
                    </button>
                    <div className="dpad-center" />
                    <button
                        className="dpad-btn dpad-right"
                        onTouchStart={() => handleTouchStart('ArrowRight')}
                        onTouchEnd={() => handleTouchEnd('ArrowRight')}
                        onMouseDown={() => handleTouchStart('ArrowRight')}
                        onMouseUp={() => handleTouchEnd('ArrowRight')}
                        onMouseLeave={() => handleTouchEnd('ArrowRight')}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        ▶
                    </button>
                </div>
                <button
                    className="dpad-btn dpad-down"
                    onTouchStart={() => handleTouchStart('ArrowDown')}
                    onTouchEnd={() => handleTouchEnd('ArrowDown')}
                    onMouseDown={() => handleTouchStart('ArrowDown')}
                    onMouseUp={() => handleTouchEnd('ArrowDown')}
                    onMouseLeave={() => handleTouchEnd('ArrowDown')}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    ▼
                </button>
            </div>

            {/* Action button (honk) */}
            <button
                className="action-btn"
                onTouchStart={() => simulateKey('KeyH', 'keydown')}
                onTouchEnd={() => simulateKey('KeyH', 'keyup')}
                onMouseDown={() => simulateKey('KeyH', 'keydown')}
                onMouseUp={() => simulateKey('KeyH', 'keyup')}
                onMouseLeave={() => simulateKey('KeyH', 'keyup')}
                onContextMenu={(e) => e.preventDefault()}
            >
                🔊
            </button>
        </div>
    );
});

export default MobileControls;
