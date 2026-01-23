/**
 * SettingsButton - Gear icon button to open settings
 * Positioned in HUD area
 * @module components/UI/SettingsButton
 */

import { memo, useState, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { SettingsModal } from './SettingsModal';
import './SettingsButton.css';

export const SettingsButton = memo(function SettingsButton() {
    const [isOpen, setIsOpen] = useState(false);
    const updateSettings = useGameStore((state) => state.updateSettings);

    // Load quality from localStorage on mount
    useEffect(() => {
        try {
            const savedQuality = localStorage.getItem('graphicsQuality');
            if (savedQuality === 'low' || savedQuality === 'high') {
                updateSettings({ graphicsQuality: savedQuality });
            }
        } catch (e) {
            console.warn('[SettingsButton] localStorage unavailable');
        }
    }, [updateSettings]);

    return (
        <>
            <button
                className="settings-button"
                onClick={() => setIsOpen(true)}
                aria-label="Settings"
            >
                ⚙️
            </button>

            <SettingsModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
});

export default SettingsButton;
