/**
 * Mobile Touch Controls Component
 * D-pad for vehicle control on mobile devices
 * Supports both touch (mobile) and mouse (desktop testing) with duplicate prevention
 * @module components/UI/MobileControls
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
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
 * Uses touch detection to prevent duplicate events on touch devices
 */
export const MobileControls = memo(function MobileControls() {
    const showMobileControls = useGameStore((state) => state.ui.showMobileControls);
    const activeKeys = useRef<Set<string>>(new Set());

    // Track if device supports touch to prevent duplicate touch+mouse events
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    // Detect touch device on first touch
    useEffect(() => {
        const handleFirstTouch = () => {
            setIsTouchDevice(true);
            window.removeEventListener('touchstart', handleFirstTouch);
        };
        window.addEventListener('touchstart', handleFirstTouch, { passive: true });
        return () => window.removeEventListener('touchstart', handleFirstTouch);
    }, []);

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

    // Mouse handlers - only fire if NOT a touch device
    const handleMouseDown = useCallback((key: string) => {
        if (!isTouchDevice) {
            handleTouchStart(key);
        }
    }, [isTouchDevice, handleTouchStart]);

    const handleMouseUp = useCallback((key: string) => {
        if (!isTouchDevice) {
            handleTouchEnd(key);
        }
    }, [isTouchDevice, handleTouchEnd]);

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
                    onMouseDown={() => handleMouseDown('ArrowUp')}
                    onMouseUp={() => handleMouseUp('ArrowUp')}
                    onMouseLeave={() => handleMouseUp('ArrowUp')}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    ▲
                </button>
                <div className="dpad-row">
                    <button
                        className="dpad-btn dpad-left"
                        onTouchStart={() => handleTouchStart('ArrowLeft')}
                        onTouchEnd={() => handleTouchEnd('ArrowLeft')}
                        onMouseDown={() => handleMouseDown('ArrowLeft')}
                        onMouseUp={() => handleMouseUp('ArrowLeft')}
                        onMouseLeave={() => handleMouseUp('ArrowLeft')}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        ◀
                    </button>
                    <div className="dpad-center" />
                    <button
                        className="dpad-btn dpad-right"
                        onTouchStart={() => handleTouchStart('ArrowRight')}
                        onTouchEnd={() => handleTouchEnd('ArrowRight')}
                        onMouseDown={() => handleMouseDown('ArrowRight')}
                        onMouseUp={() => handleMouseUp('ArrowRight')}
                        onMouseLeave={() => handleMouseUp('ArrowRight')}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        ▶
                    </button>
                </div>
                <button
                    className="dpad-btn dpad-down"
                    onTouchStart={() => handleTouchStart('ArrowDown')}
                    onTouchEnd={() => handleTouchEnd('ArrowDown')}
                    onMouseDown={() => handleMouseDown('ArrowDown')}
                    onMouseUp={() => handleMouseUp('ArrowDown')}
                    onMouseLeave={() => handleMouseUp('ArrowDown')}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    ▼
                </button>
            </div>

            {/* Action button (honk) */}
            <button
                className="action-btn"
                onTouchStart={() => simulateKey('Space', 'keydown')}
                onTouchEnd={() => simulateKey('Space', 'keyup')}
                onMouseDown={() => !isTouchDevice && simulateKey('Space', 'keydown')}
                onMouseUp={() => !isTouchDevice && simulateKey('Space', 'keyup')}
                onMouseLeave={() => !isTouchDevice && simulateKey('Space', 'keyup')}
                onContextMenu={(e) => e.preventDefault()}
            >
                🔊
            </button>
        </div>
    );
});

export default MobileControls;
