/**
 * JournalModal - Shows collection progress and building stamps
 * Press J to open/close, Escape to close
 * @module components/UI/JournalModal
 */

import { memo, useMemo } from 'react';
import { useCollectibleStore } from '../../stores/collectibleStore';
import { useGameStore } from '../../stores/gameStore';
import { COLLECTIBLES, COLLECTIBLE_VISUALS } from '../../data/collectibles';
import './JournalModal.css';

// Building definitions
const BUILDINGS = [
    { id: 'tech-hub', name: 'Tech Hub', icon: '🏢' },
    { id: 'creative-studio', name: 'Creative Studio', icon: '🎨' },
    { id: 'data-center', name: 'Data Center', icon: '💾' },
    { id: 'innovation-lab', name: 'Innovation Lab', icon: '🔬' },
    { id: 'warung', name: 'Warung Chat', icon: '☕' },
];

const TOTAL_COLLECTIBLES = 15;

export const JournalModal = memo(function JournalModal() {
    const showJournal = useGameStore((state) => state.ui.showJournal);
    const closeJournal = useGameStore((state) => state.closeJournal);
    const visitedBuildings = useGameStore((state) => state.game.visitedBuildings);

    // Select primitive values to avoid infinite re-render
    const collected = useCollectibleStore((state) => state.collected);
    const collectedCount = collected.size;
    const percent = Math.round((collectedCount / TOTAL_COLLECTIBLES) * 100);

    // Memoize the isCollected check
    const isItemCollected = useMemo(() => {
        return (id: string) => collected.has(id);
    }, [collected]);

    if (!showJournal) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            closeJournal();
        }
    };

    return (
        <div className="journal-modal__backdrop" onClick={handleBackdropClick}>
            <div className="journal-modal">
                <header className="journal-modal__header">
                    <h2 className="journal-modal__title">📖 Portfolio Journal</h2>
                    <button className="journal-modal__close" onClick={closeJournal}>
                        ✕
                    </button>
                </header>

                <div className="journal-modal__content">
                    {/* Buildings Section */}
                    <section className="journal-modal__section">
                        <h3 className="journal-modal__section-title">Buildings Visited</h3>
                        <div className="journal-modal__grid">
                            {BUILDINGS.map((building) => {
                                const visited = visitedBuildings.includes(building.id);
                                return (
                                    <div
                                        key={building.id}
                                        className={`journal-modal__item ${visited ? 'collected' : 'locked'}`}
                                        title={building.name}
                                    >
                                        <span className="journal-modal__item-icon">{building.icon}</span>
                                        {visited && <span className="journal-modal__checkmark">✓</span>}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="journal-modal__count">
                            {visitedBuildings.length}/{BUILDINGS.length} visited
                        </p>
                    </section>

                    {/* Collectibles Section */}
                    <section className="journal-modal__section">
                        <h3 className="journal-modal__section-title">Collectibles</h3>
                        <div className="journal-modal__grid journal-modal__grid--large">
                            {COLLECTIBLES.map((collectible) => {
                                const isCollected = isItemCollected(collectible.id);
                                const visual = COLLECTIBLE_VISUALS[collectible.type];
                                return (
                                    <div
                                        key={collectible.id}
                                        className={`journal-modal__item ${isCollected ? 'collected' : 'locked'}`}
                                        title={`${visual.description} ${isCollected ? '✓' : '(not found)'}`}
                                    >
                                        <span className="journal-modal__item-icon">
                                            {visual.emoji}
                                        </span>
                                        {isCollected && <span className="journal-modal__checkmark">✓</span>}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="journal-modal__count">
                            {collectedCount}/{TOTAL_COLLECTIBLES} collected
                        </p>
                    </section>

                    {/* Overall Progress */}
                    <section className="journal-modal__section journal-modal__section--progress">
                        <div className="journal-modal__progress-bar-container">
                            <div
                                className="journal-modal__progress-bar"
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                        <p className="journal-modal__progress-text">
                            {percent}% Complete
                        </p>
                    </section>
                </div>

                <footer className="journal-modal__footer">
                    <span className="journal-modal__hint">Press J or Escape to close</span>
                </footer>
            </div>
        </div>
    );
});

export default JournalModal;
