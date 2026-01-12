/**
 * useGemini Hook - Handles Gemini AI chat requests
 * @module hooks/useGemini
 */

import { useState, useCallback } from 'react';
import { trackAIChat } from '../lib/posthog';
import { captureError } from '../lib/sentry';
import { projects } from '../utils/projectsData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface UseGeminiOptions {
    buildingId?: string;
}

interface UseGeminiReturn {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    sendMessage: (prompt: string) => Promise<void>;
    clearMessages: () => void;
}

/**
 * Hook for interacting with Gemini AI via backend
 */
export function useGemini({ buildingId }: UseGeminiOptions = {}): UseGeminiReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(async (prompt: string) => {
        if (!prompt.trim()) return;

        const startTime = performance.now();

        // Add user message
        const userMessage: ChatMessage = {
            role: 'user',
            content: prompt,
            timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);

        try {
            // Build context
            const context = {
                buildingId,
                projects: projects.map((p) => ({
                    id: p.id,
                    title: p.title,
                    description: p.longDescription,
                    tech: p.tech,
                })),
            };

            const response = await fetch(`${API_URL}/gemini/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, context }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get response');
            }

            const data = await response.json();
            const endTime = performance.now();

            // Add assistant message
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: data.response,
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, assistantMessage]);

            // Track analytics
            trackAIChat(buildingId || 'unknown', prompt.length, endTime - startTime);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);

            // Track error in Sentry
            captureError(err instanceof Error ? err : new Error(errorMessage), {
                feature: 'ai-chat',
                prompt,
                buildingId,
            });
        } finally {
            setIsLoading(false);
        }
    }, [buildingId]);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    return { messages, isLoading, error, sendMessage, clearMessages };
}
