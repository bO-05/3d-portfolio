/**
 * Chat Overlay Component - AI chat interface
 * Opens when visiting Warung building
 * @module components/UI/ChatOverlay
 */

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useGemini } from '../../hooks/useGemini';
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

    const { messages, isLoading, error, sendMessage, clearMessages } = useGemini({
        buildingId: insideBuilding || undefined,
    });

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleClose = useCallback(() => {
        exitBuilding();
        clearMessages();
    }, [exitBuilding, clearMessages]);

    // Handle click on backdrop (outside modal) to close
    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    }, [handleClose]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            sendMessage(input.trim());
            setInput('');
        }
    }, [input, isLoading, sendMessage]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
        }
    }, [handleSubmit]);

    if (!showChat) return null;

    return (
        <div className="chat-overlay" onClick={handleBackdropClick}>
            <div className="chat-container">
                {/* Header */}
                <div className="chat-header">
                    <div className="chat-header-title">
                        <span className="chat-icon">🍜</span>
                        <h2>Warung Chat</h2>
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
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="chat-message chat-message-assistant">
                            <div className="chat-typing">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="chat-error">
                            <p>⚠️ {error}</p>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form className="chat-input-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="chat-input"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="chat-send"
                        disabled={isLoading || !input.trim()}
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
});

export default ChatOverlay;
