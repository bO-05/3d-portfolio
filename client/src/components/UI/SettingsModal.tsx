/**
 * SettingsModal - Graphics quality settings panel
 * Two tiers only: Low (potato) and High (full effects)
 * @module components/UI/SettingsModal
 */

import { memo, useCallback } from 'react';
import { useGameStore } from '../../stores/gameStore';
import './SettingsModal.css';

export const SettingsModal = memo(function SettingsModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const settings = useGameStore((state) => state.settings);
    const updateSettings = useGameStore((state) => state.updateSettings);

    const handleQualityChange = useCallback((quality: 'low' | 'high') => {
        updateSettings({ graphicsQuality: quality });
        // Persist to localStorage
        localStorage.setItem('graphicsQuality', quality);
    }, [updateSettings]);

    if (!isOpen) return null;

    return (
        <div className="settings-modal-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                <h2>⚙️ Settings</h2>

                <div className="settings-section">
                    <h3>Graphics Quality</h3>
                    <p className="settings-hint">
                        Low for older devices, High for full effects
                    </p>

                    <div className="quality-options">
                        <button
                            className={`quality-btn ${settings.graphicsQuality === 'low' ? 'active' : ''}`}
                            onClick={() => handleQualityChange('low')}
                        >
                            <span className="quality-icon">🥔</span>
                            <span className="quality-label">Low</span>
                            <span className="quality-desc">Potato mode - no lights, simple shapes</span>
                        </button>

                        <button
                            className={`quality-btn ${settings.graphicsQuality === 'high' ? 'active' : ''}`}
                            onClick={() => handleQualityChange('high')}
                        >
                            <span className="quality-icon">✨</span>
                            <span className="quality-label">High</span>
                            <span className="quality-desc">Full effects with lighting</span>
                        </button>
                    </div>
                </div>

                <button className="settings-close-btn" onClick={onClose}>
                    Done
                </button>
            </div>
        </div>
    );
});

export default SettingsModal;
