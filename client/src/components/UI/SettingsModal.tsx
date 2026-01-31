/**
 * SettingsModal - Graphics quality settings panel
 * Three tiers: Low (potato), Medium (balanced), High (full effects)
 * Uses graphicsStore for WebGL-aware adaptive quality
 * @module components/UI/SettingsModal
 */

import { memo, useCallback } from 'react';
import { useGraphicsStore } from '../../stores/graphicsStore';
import type { QualityTier } from '../../utils/deviceDetection';
import './SettingsModal.css';

interface QualityOption {
    tier: QualityTier;
    icon: string;
    label: string;
    desc: string;
}

const QUALITY_OPTIONS: QualityOption[] = [
    {
        tier: 'low',
        icon: '🥔',
        label: 'Low',
        desc: 'Potato mode - no shadows, effects disabled',
    },
    {
        tier: 'medium',
        icon: '⚖️',
        label: 'Medium',
        desc: 'Balanced - shadows on, effects off',
    },
    {
        tier: 'high',
        icon: '✨',
        label: 'High',
        desc: 'Full effects with particles',
    },
];

export const SettingsModal = memo(function SettingsModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const { qualityTier, autoDetected, shadowsEnabled, effectsEnabled } = useGraphicsStore();
    const setQualityTier = useGraphicsStore((state) => state.setQualityTier);
    const autoDetectQuality = useGraphicsStore((state) => state.autoDetectQuality);
    const toggleShadows = useGraphicsStore((state) => state.toggleShadows);
    const toggleEffects = useGraphicsStore((state) => state.toggleEffects);

    const handleQualityChange = useCallback(
        (tier: QualityTier) => {
            setQualityTier(tier);
        },
        [setQualityTier]
    );

    const handleAutoDetect = useCallback(() => {
        autoDetectQuality();
    }, [autoDetectQuality]);

    if (!isOpen) return null;

    return (
        <div className="settings-modal-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                <h2>⚙️ Settings</h2>

                <div className="settings-section">
                    <h3>Graphics Quality</h3>
                    <p className="settings-hint">
                        {autoDetected
                            ? 'Auto-detected based on your device'
                            : 'Custom settings - click Auto to reset'}
                    </p>

                    <div className="quality-options">
                        {QUALITY_OPTIONS.map((option) => (
                            <button
                                key={option.tier}
                                className={`quality-btn ${qualityTier === option.tier ? 'active' : ''}`}
                                onClick={() => handleQualityChange(option.tier)}
                            >
                                <span className="quality-icon">{option.icon}</span>
                                <span className="quality-label">{option.label}</span>
                                <span className="quality-desc">{option.desc}</span>
                            </button>
                        ))}
                    </div>

                    <button className="auto-detect-btn" onClick={handleAutoDetect}>
                        🔄 Auto-detect
                    </button>
                </div>

                <div className="settings-section">
                    <h3>Advanced</h3>
                    <p className="settings-hint settings-hint-small">
                        Changing shadows will reload the page
                    </p>
                    <div className="toggle-options">
                        <label className="toggle-option">
                            <span>Shadows</span>
                            <input
                                type="checkbox"
                                checked={shadowsEnabled}
                                onChange={toggleShadows}
                            />
                            <span className="toggle-slider" />
                        </label>
                        <label className="toggle-option">
                            <span>Particle Effects</span>
                            <input
                                type="checkbox"
                                checked={effectsEnabled}
                                onChange={toggleEffects}
                            />
                            <span className="toggle-slider" />
                        </label>
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
