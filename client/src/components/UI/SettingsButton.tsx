/**
 * SettingsButton - Gear icon button to open settings
 * Positioned in HUD area
 * @module components/UI/SettingsButton
 */

import { memo, useState } from 'react';
import { SettingsModal } from './SettingsModal';
import './SettingsButton.css';

export const SettingsButton = memo(function SettingsButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                className="settings-button"
                onClick={() => setIsOpen(true)}
                aria-label="Settings"
            >
                ⚙️
            </button>

            <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
});

export default SettingsButton;
