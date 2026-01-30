/**
 * Chat Overlay Component - Streaming AI chat interface
 * Opens when visiting Warung building
 * @module components/UI/ChatOverlay
 * 
 * Features:
 * - Real-time streaming responses (SSE)
 * - Response caching for FAQ queries
 * - Offline detection with status badge
 * - Cancel in-progress streams
 */

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useGeminiStream } from '../../hooks/useGeminiStream';
import { parseMarkdown } from '../../lib/markdownParser';
import './ChatOverlay.css';

/**
 * Chat overlay for AI conversations
 */
export const ChatOverlay = memo(function ChatOverlay() {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const showChat = useGameStore((state) => state.ui.showChat);
    const insideBuilding = useGameStore((state) => state.player.insideBuilding);
    const exitBuilding = useGameStore((state) => state.exitBuilding);

    const {
        messages,
        isStreaming,
        isOnline,
        error,
        sendMessage,
        cancelStream,
        clearMessages
    } = useGeminiStream({
        buildingId: insideBuilding || undefined,
        enableCache: true,
    });

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleClose = useCallback(() => {
        cancelStream();
        exitBuilding();
        clearMessages();
    }, [exitBuilding, clearMessages, cancelStream]);

    // Handle click on backdrop (outside modal) to close
    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    }, [handleClose]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isStreaming) {
            sendMessage(input.trim());
            setInput('');
        }
    }, [input, isStreaming, sendMessage]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
        }
        // Escape to close
        if (e.key === 'Escape') {
            handleClose();
        }
    }, [handleSubmit, handleClose]);

    // Handle cancel button
    const handleCancel = useCallback(() => {
        cancelStream();
    }, [cancelStream]);

    if (!showChat) return null;

    return (
        <div className="chat-overlay" onClick={handleBackdropClick}>
            <div className="chat-container">
                {/* Header */}
                <div className="chat-header">
                    <div className="chat-header-title">
                        <span className="chat-icon">🍜</span>
                        <h2>Warung Chat</h2>
                        {/* Online/Offline Badge */}
                        <span className={`chat-status ${isOnline ? 'online' : 'offline'}`}>
                            {isOnline ? '●' : '○'}
                        </span>
                    </div>
                    <button className="chat-close" onClick={handleClose}>×</button>
                </div>

                {/* Messages */}
                <div className="chat-messages">
                    {messages.length === 0 && (
                        <div className="chat-welcome">
                            <p>Halo! 👋 Welcome to Warung Kopi!</p>
                            <p>Ask me anything about the developer or their projects.</p>
                            <div className="chat-suggestions">
                                <button onClick={() => sendMessage("What projects has this developer built?")}>
                                    What projects?
                                </button>
                                <button onClick={() => sendMessage("Tell me about the developer's skills")}>
                                    Developer skills
                                </button>
                                <button onClick={() => sendMessage("What tech stack does the developer use?")}>
                                    Tech stack
                                </button>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message chat-message-${msg.role}`}>
                            <div className="chat-message-content">
                                {/* Render markdown for assistant, plain text for user */}
                                {msg.role === 'assistant'
                                    ? parseMarkdown(msg.content)
                                    : msg.content
                                }
                                {/* Show cursor while streaming for assistant messages */}
                                {msg.role === 'assistant' && isStreaming && idx === messages.length - 1 && (
                                    <span className="chat-cursor">▌</span>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Offline warning */}
                    {!isOnline && (
                        <div className="chat-offline-warning">
                            <p>📡 You're offline. Cached responses may be available.</p>
                        </div>
                    )}

                    {error && (
                        <div className="chat-error">
                            <p>⚠️ {error}</p>
                            <button onClick={() => sendMessage(messages[messages.length - 2]?.content || '')}>
                                Retry
                            </button>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form className="chat-input-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="chat-input"
                        placeholder={isOnline ? "Type your message..." : "Offline - limited responses"}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isStreaming}
                        autoFocus
                    />
                    {isStreaming ? (
                        <button
                            type="button"
                            className="chat-cancel"
                            onClick={handleCancel}
                        >
                            Stop
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="chat-send"
                            disabled={!input.trim()}
                        >
                            Send
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
});

export default ChatOverlay;
