/**
 * EasterEggEffects - Visual effects for activated easter eggs
 * @module components/UI/EasterEggEffects
 */

import { memo, useState, useEffect } from 'react';
import { subscribeToEasterEggs, getEasterEggState } from '../../hooks/useEasterEggs';
import './EasterEggEffects.css';

export const EasterEggEffects = memo(function EasterEggEffects() {
    const [state, setState] = useState(getEasterEggState());
    const [elapsedTime, setElapsedTime] = useState('00:00.000');

    // Subscribe to easter egg state changes
    useEffect(() => {
        const unsubscribe = subscribeToEasterEggs(() => {
            setState({ ...getEasterEggState() });
        });
        return unsubscribe;
    }, []);

    // Speed run timer
    useEffect(() => {
        if (!state.speedRunActive || !state.speedRunStart) return;

        const interval = setInterval(() => {
            const elapsed = Date.now() - (state.speedRunStart || 0);
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            const ms = elapsed % 1000;
            setElapsedTime(
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
            );
        }, 16);

        return () => clearInterval(interval);
    }, [state.speedRunActive, state.speedRunStart]);

    return (
        <>
            {/* Konami Code Effect - Rainbow overlay flash */}
            {state.konamiActive && (
                <div className="easter-egg-konami">
                    <div className="konami-text">🎮 KONAMI CODE ACTIVATED! 🎮</div>
                </div>
            )}

            {/* Disco Mode - Flashing overlay */}
            {state.discoActive && (
                <div className="easter-egg-disco" />
            )}

            {/* Speed Run Timer */}
            {state.speedRunActive && (
                <div className="easter-egg-speedrun">
                    <div className="speedrun-label">⏱️ SPEED RUN</div>
                    <div className="speedrun-timer">{elapsedTime}</div>
                </div>
            )}
        </>
    );
});

export default EasterEggEffects;
