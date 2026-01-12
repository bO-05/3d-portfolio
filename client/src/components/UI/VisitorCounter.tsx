/**
 * Visitor Counter Component
 * Shows live visitor count in HUD
 * @module components/UI/VisitorCounter
 */

import { memo, useEffect, useState } from 'react';
import './VisitorCounter.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * HUD component showing live visitor count
 */
export const VisitorCounter = memo(function VisitorCounter() {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        // Fetch initial count
        const fetchCount = async () => {
            try {
                const response = await fetch(`${API_URL}/visitors/count`);
                if (response.ok) {
                    const data = await response.json();
                    setCount(data.count);
                }
            } catch (error) {
                console.warn('Could not fetch visitor count:', error);
            }
        };

        fetchCount();

        // Poll every 30 seconds
        const interval = setInterval(fetchCount, 30000);

        return () => clearInterval(interval);
    }, []);

    if (count === null) return null;

    return (
        <div className="visitor-counter">
            <span className="visitor-icon">👥</span>
            <span className="visitor-count">{count} explorer{count !== 1 ? 's' : ''}</span>
        </div>
    );
});

export default VisitorCounter;
