/**
 * ProgressHUD - Top-right progress counter showing collectibles and buildings
 * @module components/UI/ProgressHUD
 */

import { memo, useRef, useState, useEffect } from 'react';
import { useCollectibleStore } from '../../stores/collectibleStore';
import { useGameStore } from '../../stores/gameStore';
import './ProgressHUD.css';

// Total buildings and collectibles in the game
const TOTAL_BUILDINGS = 5;
const TOTAL_COLLECTIBLES = 15;

export const ProgressHUD = memo(function ProgressHUD() {
    // Select primitive values to avoid infinite re-render from new object
    const collectedCount = useCollectibleStore((state) => state.collected.size);
    const visitedBuildings = useGameStore((state) => state.game.visitedBuildings);
    const toggleJournal = useGameStore((state) => state.toggleJournal);

    // Animated counter state
    const prevCollected = useRef(collectedCount);
    const [displayCount, setDisplayCount] = useState(collectedCount);
    const [isAnimating, setIsAnimating] = useState(false);

    // Animate counter when value changes
    useEffect(() => {
        let rafId: number | null = null;

        if (collectedCount !== prevCollected.current) {
            setIsAnimating(true);
            let current = prevCollected.current;
            const target = collectedCount;
            const step = () => {
                current += target > current ? 1 : -1;
                setDisplayCount(current);
                if (current !== target) {
                    rafId = requestAnimationFrame(step);
                } else {
                    setIsAnimating(false);
                    rafId = null;
                }
            };
            rafId = requestAnimationFrame(step);
            prevCollected.current = collectedCount;
        }

        return () => {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
        };
    }, [collectedCount]);

    const buildingsVisited = visitedBuildings.length;
    const totalProgress = Math.round(
        ((buildingsVisited / TOTAL_BUILDINGS) * 50 + (collectedCount / TOTAL_COLLECTIBLES) * 50)
    );

    return (
        <div className="progress-hud">
            <button className="progress-hud__button" onClick={toggleJournal} title="Open Journal (J)">
                <div className="progress-hud__stats">
                    <span className="progress-hud__item">
                        <span className="progress-hud__icon">🏛️</span>
                        <span className="progress-hud__value">{buildingsVisited}/{TOTAL_BUILDINGS}</span>
                    </span>
                    <span className="progress-hud__item">
                        <span className="progress-hud__icon">⭐</span>
                        <span className={`progress-hud__value ${isAnimating ? 'progress-hud__value--pulse' : ''}`}>
                            {displayCount}/{TOTAL_COLLECTIBLES}
                        </span>
                    </span>
                </div>
                <div className="progress-hud__bar-container">
                    <div
                        className="progress-hud__bar"
                        style={{ width: `${totalProgress}%` }}
                    />
                </div>
                <div className="progress-hud__percent">{totalProgress}%</div>
            </button>
        </div>
    );
});

export default ProgressHUD;
