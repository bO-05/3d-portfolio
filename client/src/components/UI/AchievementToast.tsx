/**
 * Achievement Toast - Notification when achievement unlocked
 * @module components/UI/AchievementToast
 */

import { memo, useEffect, useState } from 'react';
import { useAchievementStore } from '../../stores/achievementStore';
import { playAchievementSound, resumeAudioContext } from '../../lib/synthSounds';
import { useGameStore } from '../../stores/gameStore';
import './AchievementToast.css';

export const AchievementToast = memo(function AchievementToast() {
    const pendingToast = useAchievementStore((state) => state.pendingToast);
    const clearToast = useAchievementStore((state) => state.clearToast);
    const soundEnabled = useGameStore((state) => state.settings.soundEnabled);
    const sfxVolume = useGameStore((state) => state.settings.sfxVolume);
    const [visible, setVisible] = useState(false);
    const [currentToast, setCurrentToast] = useState(pendingToast);

    useEffect(() => {
        if (pendingToast) {
            setCurrentToast(pendingToast);
            setVisible(true);

            // Play achievement fanfare
            if (soundEnabled) {
                resumeAudioContext();
                playAchievementSound(sfxVolume);
            }

            // Auto-dismiss after 4 seconds
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(() => {
                    clearToast();
                }, 300); // Wait for fade out animation
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [pendingToast, clearToast, soundEnabled, sfxVolume]);

    if (!currentToast) return null;

    return (
        <div className={`achievement-toast ${visible ? 'visible' : ''}`}>
            <div className="achievement-toast-icon">{currentToast.icon}</div>
            <div className="achievement-toast-content">
                <div className="achievement-toast-label">Achievement Unlocked!</div>
                <div className="achievement-toast-name">{currentToast.name}</div>
                <div className="achievement-toast-description">{currentToast.description}</div>
            </div>
        </div>
    );
});

export default AchievementToast;
