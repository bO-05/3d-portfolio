/**
 * Root App component
 * Sets up the 3D canvas with React Three Fiber
 */

import { Suspense, useEffect, lazy, useState, ComponentType } from 'react';
import { useGameStore } from './stores/gameStore';
import { LoadingScreen } from './components/UI/LoadingScreen';
import { VisitorCounter } from './components/UI/VisitorCounter';
import { MobileControls } from './components/UI/MobileControls';
import { ControlsTooltip } from './components/UI/ControlsTooltip';
import { ProgressHUD } from './components/UI/ProgressHUD';
import { Minimap } from './components/UI/Minimap';
import { SoundToggle } from './components/UI/SoundToggle';
import { JournalModal } from './components/UI/JournalModal';
import { OnboardingOverlay } from './components/UI/OnboardingOverlay';
import { AchievementToast } from './components/UI/AchievementToast';
import { EasterEggEffects } from './components/UI/EasterEggEffects';


const ProjectModal = lazy(() => import('./components/UI/ProjectModal'));
const ChatOverlay = lazy(() => import('./components/UI/ChatOverlay'));

/**
 * Determine time of day based on current hour
 */
function getTimeOfDay(): 'day' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) return 'day';
    if (hour >= 18 && hour < 20) return 'evening';
    return 'night';
}

/**
 * Main App component
 * Renders the 3D scene with loading screen and time-of-day detection
 */
export function App() {
    const setTimeOfDay = useGameStore((state) => state.setTimeOfDay);
    const setMobileControls = useGameStore((state) => state.setMobileControls);
    const isLoading = useGameStore((state) => state.game.isLoading);
    const showModal = useGameStore((state) => state.ui.showModal);
    const showChat = useGameStore((state) => state.ui.showChat);

    // Lazy-loaded SceneContainer - only imported after requestIdleCallback
    const [SceneContainer, setSceneContainer] = useState<ComponentType | null>(null);

    // Set initial time of day and mobile detection
    useEffect(() => {
        setTimeOfDay(getTimeOfDay());
        setMobileControls(window.innerWidth < 768);

        // Defer 3D scene loading until main thread is idle
        const loadScene = () => {
            import('./components/SceneContainer').then((module) => {
                setSceneContainer(() => module.default);
            });
        };

        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(loadScene, { timeout: 3000 });
        } else {
            setTimeout(loadScene, 1000);
        }

        // Update time every minute
        const interval = setInterval(() => {
            setTimeOfDay(getTimeOfDay());
        }, 60000);

        // Handle resize for mobile detection
        const handleResize = () => {
            setMobileControls(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, [setTimeOfDay, setMobileControls]);

    return (
        <>
            {isLoading && <LoadingScreen />}
            {SceneContainer && (
                <Suspense fallback={null}>
                    <SceneContainer />
                </Suspense>
            )}

            {/* HUD - Visitor counter */}
            {!isLoading && <VisitorCounter />}

            {/* Mobile touch controls */}
            {!isLoading && <MobileControls />}

            {/* Vehicle controls tooltip */}
            {!isLoading && <ControlsTooltip />}

            {/* Progress HUD - top right */}
            {!isLoading && <ProgressHUD />}

            {/* Sound toggle button - top right below HUD */}
            {!isLoading && <SoundToggle />}

            {/* Minimap - bottom left */}
            {!isLoading && <Minimap />}

            {/* Journal Modal */}
            <JournalModal />

            {/* First-visit onboarding overlay */}
            {!isLoading && <OnboardingOverlay />}

            {/* Achievement notifications */}
            <AchievementToast />

            {/* Easter egg effects */}
            <EasterEggEffects />

            {/* Project modal overlay */}
            {showModal && (
                <Suspense fallback={null}>
                    <ProjectModal />
                </Suspense>
            )}

            {/* AI Chat overlay - Warung */}
            {showChat && (
                <Suspense fallback={null}>
                    <ChatOverlay />
                </Suspense>
            )}
        </>
    );
}
