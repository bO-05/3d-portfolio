/**
 * Mobile Touch Controls Component
 * D-pad for vehicle control on mobile devices
 * Supports both touch (mobile) and mouse (desktop testing) with duplicate prevention
 * @module components/UI/MobileControls
 */

import { memo, useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import './MobileControls.css';

/**
 * Simulate keyboard events for vehicle control
 * Maps key names to correct KeyboardEvent key/code values
 */
function simulateKey(keyName: string, type: 'keydown' | 'keyup') {
    // Map key names to correct key property values
    // Space key should have key: ' ' (space character), not key: 'Space'
    const keyMap: Record<string, { key: string; code: string }> = {
        'ArrowUp': { key: 'ArrowUp', code: 'ArrowUp' },
        'ArrowDown': { key: 'ArrowDown', code: 'ArrowDown' },
        'ArrowLeft': { key: 'ArrowLeft', code: 'ArrowLeft' },
        'ArrowRight': { key: 'ArrowRight', code: 'ArrowRight' },
        'Space': { key: ' ', code: 'Space' },
    };
    const { key, code } = keyMap[keyName] || { key: keyName, code: keyName };
    window.dispatchEvent(new KeyboardEvent(type, { key, code }));
}

/**
 * Mobile-only touch controls for vehicle movement
 * Uses touch detection to prevent duplicate events on touch devices
 */
export const MobileControls = memo(function MobileControls() {
    const showMobileControls = useGameStore((state) => state.ui.showMobileControls);
    const activeKeys = useRef<Set<string>>(new Set());

    // Track if device supports touch to prevent duplicate touch+mouse events
    // Using useRef instead of useState to avoid race condition on first touch
    const isTouchDevice = useRef(false);

    // Detect touch device on first touch (synchronous update via ref)
    useEffect(() => {
        const handleFirstTouch = () => {
            isTouchDevice.current = true;
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

    // Mouse handlers - only fire if NOT a touch device (synchronous check via ref)
    const handleMouseDown = useCallback((key: string) => {
        if (!isTouchDevice.current) {
            handleTouchStart(key);
        }
    }, [handleTouchStart]);

    const handleMouseUp = useCallback((key: string) => {
        if (!isTouchDevice.current) {
            handleTouchEnd(key);
        }
    }, [handleTouchEnd]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            activeKeys.current.forEach((key) => {
                simulateKey(key, 'keyup');
            });
        };
    }, []);

    // Release all keys when controls are hidden to prevent stuck inputs
    useEffect(() => {
        if (!showMobileControls) {
            const keysToRelease = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
            keysToRelease.forEach(key => {
                if (activeKeys.current.has(key)) {
                    activeKeys.current.delete(key);
                    simulateKey(key, 'keyup');
                }
            });
        }
    }, [showMobileControls]);

    if (!showMobileControls) return null;

    return (
        <div className="mobile-controls">
            {/* D-pad */}
            {/* Left Hand: Steering */}
            <div className="steering-controls">
                <button
                    className="dpad-btn dpad-left"
                    aria-label="Turn Left"
                    onTouchStart={() => handleTouchStart('ArrowLeft')}
                    onTouchEnd={() => handleTouchEnd('ArrowLeft')}
                    onTouchCancel={() => handleTouchEnd('ArrowLeft')}
                    onMouseDown={() => handleMouseDown('ArrowLeft')}
                    onMouseUp={() => handleMouseUp('ArrowLeft')}
                    onMouseLeave={() => handleMouseUp('ArrowLeft')}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    ◀
                </button>
                <button
                    className="dpad-btn dpad-right"
                    aria-label="Turn Right"
                    onTouchStart={() => handleTouchStart('ArrowRight')}
                    onTouchEnd={() => handleTouchEnd('ArrowRight')}
                    onTouchCancel={() => handleTouchEnd('ArrowRight')}
                    onMouseDown={() => handleMouseDown('ArrowRight')}
                    onMouseUp={() => handleMouseUp('ArrowRight')}
                    onMouseLeave={() => handleMouseUp('ArrowRight')}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    ▶
                </button>
            </div>

            {/* Right Hand: Action (Gas, Brake, Horn) */}
            <div className="action-controls">
                <div className="gas-brake-group">
                    <button
                        className="dpad-btn dpad-up"
                        aria-label="Accelerate"
                        onTouchStart={() => handleTouchStart('ArrowUp')}
                        onTouchEnd={() => handleTouchEnd('ArrowUp')}
                        onTouchCancel={() => handleTouchEnd('ArrowUp')}
                        onMouseDown={() => handleMouseDown('ArrowUp')}
                        onMouseUp={() => handleMouseUp('ArrowUp')}
                        onMouseLeave={() => handleMouseUp('ArrowUp')}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        ▲
                    </button>
                    <button
                        className="dpad-btn dpad-down"
                        aria-label="Brake / Reverse"
                        onTouchStart={() => handleTouchStart('ArrowDown')}
                        onTouchEnd={() => handleTouchEnd('ArrowDown')}
                        onTouchCancel={() => handleTouchEnd('ArrowDown')}
                        onMouseDown={() => handleMouseDown('ArrowDown')}
                        onMouseUp={() => handleMouseUp('ArrowDown')}
                        onMouseLeave={() => handleMouseUp('ArrowDown')}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        ▼
                    </button>
                </div>

                <button
                    className="action-btn"
                    aria-label="Honk Horn"
                    onTouchStart={() => handleTouchStart('Space')}
                    onTouchEnd={() => handleTouchEnd('Space')}
                    onTouchCancel={() => handleTouchEnd('Space')}
                    onMouseDown={() => handleMouseDown('Space')}
                    onMouseUp={() => handleMouseUp('Space')}
                    onMouseLeave={() => handleMouseUp('Space')}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    🔊
                </button>
            </div>
        </div>
    );
});

export default MobileControls;
