/**
 * Controls Tooltip Component
 * Shows vehicle controls when user clicks on Bajaj
 * @module components/UI/ControlsTooltip
 */

import { memo, useState, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import './ControlsTooltip.css';

/**
 * Floating controls tooltip that shows on vehicle click
 */
export const ControlsTooltip = memo(function ControlsTooltip() {
    const [isVisible, setIsVisible] = useState(false);
    const showControlsTooltip = useGameStore((state) => state.ui.showControlsTooltip);
    const hideControlsTooltip = useGameStore((state) => state.hideControlsTooltip);
    const engineOn = useGameStore((state) => state.vehicle.engineOn);
    const headlightsOn = useGameStore((state) => state.vehicle.headlightsOn);

    useEffect(() => {
        setIsVisible(showControlsTooltip);
    }, [showControlsTooltip]);

    // Auto-hide after 5 seconds
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                hideControlsTooltip();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, hideControlsTooltip]);

    if (!isVisible) return null;

    return (
        <div className="controls-tooltip" onClick={hideControlsTooltip}>
            <div className="controls-header">
                <span className="controls-icon">🛺</span>
                <h3>Bajaj Controls</h3>
                <span className={`engine-status ${engineOn ? 'on' : 'off'}`}>
                    ⚙️ {engineOn ? 'ON' : 'OFF'}
                </span>
                <span className={`engine-status ${headlightsOn ? 'on' : 'off'}`}>
                    💡 {headlightsOn ? 'ON' : 'OFF'}
                </span>
            </div>
            <div className="controls-list">
                <div className="control-item">
                    <kbd>E</kbd>
                    <span>Toggle Engine</span>
                </div>
                <div className="control-item">
                    <kbd>W</kbd> / <kbd>↑</kbd>
                    <span>Accelerate</span>
                </div>
                <div className="control-item">
                    <kbd>S</kbd> / <kbd>↓</kbd>
                    <span>Reverse</span>
                </div>
                <div className="control-item">
                    <kbd>A</kbd> <kbd>D</kbd>
                    <span>Turn (needs speed)</span>
                </div>
                <div className="control-item">
                    <kbd>Shift</kbd>
                    <span>Boost</span>
                </div>
                <div className="control-item">
                    <kbd>Space</kbd>
                    <span>Honk</span>
                </div>
                <div className="control-item">
                    <kbd>C</kbd>
                    <span>Headlights</span>
                </div>
            </div>
            <div className="controls-footer">
                Click anywhere to close
            </div>
        </div>
    );
});

export default ControlsTooltip;
