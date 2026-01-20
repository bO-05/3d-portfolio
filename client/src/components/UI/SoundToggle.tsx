/**
 * SoundToggle.tsx - Mute/Unmute button for SFX
 * 
 * Floating button that toggles soundEnabled setting.
 * Works on both mobile and desktop.
 * 
 * @module components/UI/SoundToggle
 */

import { memo } from 'react';
import { useGameStore } from '../../stores/gameStore';
import './SoundToggle.css';

export const SoundToggle = memo(function SoundToggle() {
    const soundEnabled = useGameStore((state) => state.settings.soundEnabled);
    const toggleSound = useGameStore((state) => state.toggleSound);

    return (
        <button
            className="sound-toggle"
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            title={soundEnabled ? 'Click to mute' : 'Click to unmute'}
        >
            <span className="sound-toggle__icon">
                {soundEnabled ? '🔊' : '🔇'}
            </span>
        </button>
    );
});

export default SoundToggle;
