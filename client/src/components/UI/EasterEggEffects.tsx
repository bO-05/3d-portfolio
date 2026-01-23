/**
 * EasterEggEffects - Visual effects for activated easter eggs
 * Includes: Konami overlay, Disco mode, Speed run timer, Confetti, Wheelie indicator, Jakarta Sky toggle
 * @module components/UI/EasterEggEffects
 */

import { memo, useSyncExternalStore, useMemo } from 'react';
import { subscribeToEasterEggs, getEasterEggState, useEasterEggs, toggleJakartaSky } from '../../hooks/useEasterEggs';
import './EasterEggEffects.css';

/**
 * Hook to subscribe to easter egg state changes
 */
function useEasterEggState() {
    return useSyncExternalStore(subscribeToEasterEggs, getEasterEggState, getEasterEggState);
}

/**
 * Confetti particle configuration (generated once)
 */
interface ParticleConfig {
    left: number;
    delay: number;
    duration: number;
    size: number;
    rotation: number;
    color: string;
}

const CONFETTI_COLORS = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#1dd1a1', '#5f27cd'];

/**
 * Confetti particle component with stable config
 */
const ConfettiParticle = memo(function ConfettiParticle({ config }: { config: ParticleConfig }) {
    return (
        <div
            className="confetti-particle"
            style={{
                left: `${config.left}%`,
                backgroundColor: config.color,
                width: `${config.size}px`,
                height: `${config.size}px`,
                animationDelay: `${config.delay}s`,
                animationDuration: `${config.duration}s`,
                transform: `rotate(${config.rotation}deg)`,
            }}
        />
    );
});

/**
 * Confetti burst effect with stable particle configs
 */
const Confetti = memo(function Confetti() {
    // Generate particle configs once with useMemo to prevent flicker
    const particles = useMemo(() =>
        Array.from({ length: 50 }, (_, i) => ({
            index: i,
            config: {
                left: Math.random() * 100,
                delay: Math.random() * 0.5,
                duration: 2 + Math.random() * 2,
                size: 8 + Math.random() * 8,
                rotation: Math.random() * 360,
                color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            } as ParticleConfig
        }))
        , []);

    return (
        <div className="confetti-container">
            {particles.map(p => (
                <ConfettiParticle key={p.index} config={p.config} />
            ))}
            <div className="confetti-text">🎊 Music Studio Circled 5x! 🎊</div>
        </div>
    );
});

/**
 * Wheelie indicator
 */
const WheelieIndicator = memo(function WheelieIndicator() {
    return (
        <div className="wheelie-indicator">
            <span className="wheelie-emoji">🏍️</span>
            <span className="wheelie-text">WHEELIE!</span>
        </div>
    );
});

/**
 * Jakarta Sky Toggle Button
 */
const JakartaSkyToggle = memo(function JakartaSkyToggle({ isActive }: { isActive: boolean }) {
    return (
        <button
            className="jakarta-sky-toggle"
            onClick={toggleJakartaSky}
            style={{
                position: 'fixed',
                top: '120px',
                right: '20px',
                padding: '10px 16px',
                background: isActive
                    ? 'linear-gradient(135deg, #ff6b6b, #feca57)'
                    : 'rgba(0, 0, 0, 0.6)',
                border: isActive ? '2px solid #fff' : '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '25px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 1000,
                transition: 'all 0.3s ease',
                boxShadow: isActive
                    ? '0 4px 15px rgba(255, 107, 107, 0.4)'
                    : '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
        >
            <span>🌅</span>
            <span>{isActive ? 'Jakarta Sky ON' : 'Jakarta Sky OFF'}</span>
        </button>
    );
});

export const EasterEggEffects = memo(function EasterEggEffects() {
    const state = useEasterEggState();

    // Register keyboard event listeners for easter eggs
    useEasterEggs();

    // Note: Speed run timer is now handled by SpeedrunOverlay component

    return (
        <>
            {/* Konami Code Effect - Rainbow overlay flash + vehicle swap message */}
            {state.konamiActive && (
                <div className="easter-egg-konami">
                    <div className="konami-text">
                        🎮 KONAMI CODE! Vehicle: {state.vehicleSwapped ? '🚌 TransJakarta' : '🛺 Bajaj'} 🎮
                    </div>
                </div>
            )}

            {/* Disco Mode - Flashing overlay */}
            {state.discoActive && (
                <div className="easter-egg-disco" />
            )}

            {/* Speed run is now handled by SpeedrunOverlay component */}

            {/* Wheelie Indicator */}
            {state.wheelieActive && (
                <WheelieIndicator />
            )}

            {/* Confetti Effect */}
            {state.confettiActive && (
                <Confetti />
            )}

            {/* Jakarta Sky Toggle (shown when unlocked) */}
            {state.jakartaSkyToggleVisible && (
                <JakartaSkyToggle isActive={state.jakartaSkyActive} />
            )}
        </>
    );
});

export default EasterEggEffects;
