/**
 * OnboardingOverlay - First-visit welcome tutorial
 * Shows step-by-step guide on first visit, stored in localStorage
 * @module components/UI/OnboardingOverlay
 */

import { memo, useState, useEffect, useCallback } from 'react';
import './OnboardingOverlay.css';

const STORAGE_KEY = 'jakarta-onboarding-complete';

interface OnboardingStep {
    title: string;
    description: string;
    icon: string;
    hint?: string;
}

const STEPS: OnboardingStep[] = [
    {
        title: 'Welcome to Jakarta Street! 🌴',
        description: 'Explore my interactive portfolio by driving around this Jakarta-inspired street.',
        icon: '🏙️',
    },
    {
        title: 'Meet Your Bajaj 🛺',
        description: 'This three-wheeled vehicle is your ride. Press E to start the engine!',
        icon: '🔑',
        hint: 'E = Engine',
    },
    {
        title: 'Drive Around',
        description: 'Use WASD or Arrow Keys to move. Hold Shift for a speed boost!',
        icon: '🎮',
        hint: 'W/S = Forward/Back • A/D = Turn',
    },
    {
        title: 'Explore Buildings 🏛️',
        description: 'Drive close to buildings to see my projects. Each building showcases different work.',
        icon: '💼',
    },
    {
        title: 'Collect Items ⭐',
        description: 'Find glowing collectibles around the map! Some are hidden in bushes and boxes.',
        icon: '🎯',
        hint: 'Press J to open your Journal',
    },
    {
        title: 'Ready to Explore!',
        description: 'Have fun exploring! Press C for headlights at night.',
        icon: '🚀',
    },
];

export const OnboardingOverlay = memo(function OnboardingOverlay() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    // Check if onboarding should be shown
    useEffect(() => {
        const completed = localStorage.getItem(STORAGE_KEY);
        if (!completed) {
            // Small delay to let the scene load first
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleNext = useCallback(() => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            handleComplete();
        }
    }, [currentStep]);

    const handlePrev = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    }, [currentStep]);

    const handleComplete = useCallback(() => {
        if (dontShowAgain) {
            localStorage.setItem(STORAGE_KEY, 'true');
        }
        setIsVisible(false);
    }, [dontShowAgain]);

    const handleSkip = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsVisible(false);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        if (!isVisible) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'ArrowRight' || e.code === 'Enter' || e.code === 'Space') {
                e.preventDefault();
                handleNext();
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                handlePrev();
            } else if (e.code === 'Escape') {
                handleSkip();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVisible, handleNext, handlePrev, handleSkip]);

    if (!isVisible) return null;

    const step = STEPS[currentStep];
    if (!step) return null;

    const isLastStep = currentStep === STEPS.length - 1;

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-modal">
                {/* Progress dots */}
                <div className="onboarding-progress">
                    {STEPS.map((_, index) => (
                        <div
                            key={index}
                            className={`onboarding-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                        />
                    ))}
                </div>

                {/* Step content */}
                <div className="onboarding-content">
                    <div className="onboarding-icon">{step.icon}</div>
                    <h2 className="onboarding-title">{step.title}</h2>
                    <p className="onboarding-description">{step.description}</p>

                    {step.hint && (
                        <div className="onboarding-hint">
                            <kbd>{step.hint}</kbd>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="onboarding-navigation">
                    <button
                        className="onboarding-btn onboarding-btn--secondary"
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                    >
                        ← Back
                    </button>

                    <button
                        className="onboarding-btn onboarding-btn--primary"
                        onClick={handleNext}
                    >
                        {isLastStep ? "Let's Go! 🚀" : 'Next →'}
                    </button>
                </div>

                {/* Footer */}
                <div className="onboarding-footer">
                    {!isLastStep && (
                        <button className="onboarding-skip" onClick={handleSkip}>
                            Skip Tutorial
                        </button>
                    )}

                    {isLastStep && (
                        <label className="onboarding-checkbox">
                            <input
                                type="checkbox"
                                checked={dontShowAgain}
                                onChange={(e) => setDontShowAgain(e.target.checked)}
                            />
                            Don't show again
                        </label>
                    )}
                </div>

                {/* Keyboard hint */}
                <div className="onboarding-keyboard-hint">
                    Use ← → or Enter to navigate • Esc to skip
                </div>
            </div>
        </div>
    );
});

export default OnboardingOverlay;
