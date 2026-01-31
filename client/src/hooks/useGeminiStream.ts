/**
 * useGeminiStream Hook - Handles streaming Gemini AI chat with SSE
 * @module hooks/useGeminiStream
 * 
 * Features:
 * - Real-time token streaming via SSE
 * - Response caching for FAQ queries
 * - Offline detection
 * - Exponential backoff retry
 * - AbortController for cancellation
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { trackAIChat } from '../lib/analytics';
import { captureError } from '../lib/sentry';
import { projects } from '../utils/projectsData';
import { getCachedResponse, setCachedResponse } from '../lib/chatCache';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface UseGeminiStreamOptions {
    buildingId?: string;
    enableCache?: boolean;
}

interface UseGeminiStreamReturn {
    messages: ChatMessage[];
    isStreaming: boolean;
    isOnline: boolean;
    error: string | null;
    sendMessage: (prompt: string) => Promise<void>;
    cancelStream: () => void;
    clearMessages: () => void;
}

// ─────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch with exponential backoff retry
 */
async function fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries = 3
): Promise<Response> {
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);

            if (response.ok) return response;

            if (response.status === 429) {
                // Rate limited - wait longer
                const delay = Math.pow(2, attempt + 2) * 1000;
                await sleep(delay);
                continue;
            }

            // Client errors (4xx, except 429) will never succeed - throw immediately without retry
            if (response.status >= 400 && response.status < 500) {
                const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            // Other errors - throw immediately
            const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error');

            // Don't retry on abort or 4xx client errors
            if (lastError.name === 'AbortError') throw lastError;
            if (lastError.message.includes('HTTP 4')) throw lastError;

            const delay = Math.pow(2, attempt) * 1000;
            await sleep(delay);
        }
    }

    throw lastError;
}

/**
 * Simulate typing effect for cached responses
 */
async function simulateTyping(
    text: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
): Promise<void> {
    const words = text.split(' ');
    const chunkSize = 3; // Words per chunk

    for (let i = 0; i < words.length; i += chunkSize) {
        if (signal?.aborted) return;

        const chunk = words.slice(i, i + chunkSize).join(' ') + ' ';
        onChunk(chunk);
        await sleep(30); // 30ms between chunks
    }
}

// ─────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────

/**
 * Hook for streaming Gemini AI chat via SSE
 */
export function useGeminiStream({
    buildingId,
    enableCache = true
}: UseGeminiStreamOptions = {}): UseGeminiStreamReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [error, setError] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);

    // Track online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const sendMessage = useCallback(async (prompt: string) => {
        if (!prompt.trim()) return;

        const startTime = performance.now();

        // Cancel any existing stream
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        // Add user message immediately (optimistic UI)
        const userMessage: ChatMessage = {
            role: 'user',
            content: prompt,
            timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsStreaming(true);
        setError(null);

        // Check cache first
        if (enableCache) {
            const cached = getCachedResponse(prompt);
            if (cached) {
                // Add empty assistant message to stream into
                const assistantMessage: ChatMessage = {
                    role: 'assistant',
                    content: '',
                    timestamp: Date.now(),
                };
                setMessages((prev) => [...prev, assistantMessage]);

                // Simulate typing for cached response
                await simulateTyping(
                    cached,
                    (chunk) => {
                        setMessages((prev) => {
                            const updated = [...prev];
                            const lastIdx = updated.length - 1;
                            if (updated[lastIdx]?.role === 'assistant') {
                                updated[lastIdx] = {
                                    ...updated[lastIdx],
                                    content: updated[lastIdx].content + chunk,
                                };
                            }
                            return updated;
                        });
                    },
                    signal
                );

                setIsStreaming(false);
                return;
            }
        }

        // Check if offline
        if (!navigator.onLine) {
            setError('You appear to be offline. Please check your connection.');
            setIsStreaming(false);
            return;
        }

        try {
            // Build context (send minimal data to reduce payload)
            const context = {
                buildingId,
                projects: projects.map((p) => ({
                    id: p.id,
                    title: p.title,
                    description: p.longDescription,
                    tech: p.tech,
                })),
            };

            // Add empty assistant message to stream into
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: '',
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, assistantMessage]);

            // Fetch with retry and streaming
            const response = await fetchWithRetry(
                `${API_URL}/gemini/stream`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt, context }),
                    signal,
                },
                3
            );

            // Read SSE stream
            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body');

            const decoder = new TextDecoder();
            let buffer = '';
            let fullResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const data = line.slice(6);

                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);

                        if (parsed.error) {
                            throw new Error(parsed.error);
                        }

                        if (parsed.text) {
                            fullResponse += parsed.text;

                            // Update the assistant message
                            setMessages((prev) => {
                                const updated = [...prev];
                                const lastIdx = updated.length - 1;
                                if (updated[lastIdx]?.role === 'assistant') {
                                    updated[lastIdx] = {
                                        ...updated[lastIdx],
                                        content: updated[lastIdx].content + parsed.text,
                                    };
                                }
                                return updated;
                            });
                        }
                    } catch (parseError) {
                        // Skip invalid JSON
                    }
                }
            }

            const endTime = performance.now();

            // Cache the response
            if (enableCache && fullResponse) {
                setCachedResponse(prompt, fullResponse);
            }

            // Track analytics
            trackAIChat(buildingId || 'unknown', prompt.length, endTime - startTime);
        } catch (err) {
            // Handle abort gracefully
            if (err instanceof Error && err.name === 'AbortError') {
                return;
            }

            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);

            // Track error in Sentry
            captureError(err instanceof Error ? err : new Error(errorMessage), {
                feature: 'ai-chat-stream',
                prompt,
                buildingId,
            });
        } finally {
            setIsStreaming(false);
        }
    }, [buildingId, enableCache]);

    const cancelStream = useCallback(() => {
        abortControllerRef.current?.abort();
        setIsStreaming(false);
    }, []);

    const clearMessages = useCallback(() => {
        abortControllerRef.current?.abort();
        setMessages([]);
        setError(null);
        setIsStreaming(false);
    }, []);

    return {
        messages,
        isStreaming,
        isOnline,
        error,
        sendMessage,
        cancelStream,
        clearMessages
    };
}
