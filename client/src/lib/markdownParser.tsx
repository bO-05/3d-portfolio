/**
 * Simple Markdown Parser for Chat Messages
 * Handles basic markdown formatting without heavy dependencies
 * 
 * Supported syntax:
 * - **bold** or __bold__
 * - *italic* or _italic_
 * - `inline code`
 * - [link text](url)
 * - Line breaks
 * 
 * @module lib/markdownParser
 */

import React from 'react';

/**
 * Parse markdown text and return React elements
 */
export function parseMarkdown(text: string): React.ReactNode {
    if (!text) return null;

    // Split by newlines first, then process each line
    const lines = text.split('\n');

    return lines.map((line, lineIdx) => (
        <React.Fragment key={lineIdx}>
            {lineIdx > 0 && <br />}
            {parseLine(line)}
        </React.Fragment>
    ));
}

/**
 * Parse a single line of markdown
 */
function parseLine(line: string): React.ReactNode {
    if (!line) return null;

    const elements: React.ReactNode[] = [];
    let currentIndex = 0;
    let key = 0;

    // Combined regex for all patterns
    // Order matters: longer patterns first (** before *)
    const patterns = [
        // Bold: **text** or __text__
        { regex: /\*\*([^*]+)\*\*|__([^_]+)__/g, type: 'bold' },
        // Italic: *text* or _text_ (but not inside words for underscore)
        { regex: /\*([^*]+)\*|(?<!\w)_([^_]+)_(?!\w)/g, type: 'italic' },
        // Inline code: `code`
        { regex: /`([^`]+)`/g, type: 'code' },
        // Links: [text](url)
        { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'link' },
    ];

    // Find all matches with their positions
    interface Match {
        start: number;
        end: number;
        type: string;
        content: string;
        url?: string;
    }

    const allMatches: Match[] = [];

    for (const { regex, type } of patterns) {
        const lineRegex = new RegExp(regex.source, 'g');
        let match;

        while ((match = lineRegex.exec(line)) !== null) {
            const content = match[1] || match[2] || '';
            const matchData: Match = {
                start: match.index,
                end: match.index + match[0].length,
                type,
                content,
            };

            // For links, capture the URL
            if (type === 'link') {
                matchData.url = match[2] || '';
                matchData.content = match[1] || '';
            }

            allMatches.push(matchData);
        }
    }

    // Sort by start position
    allMatches.sort((a, b) => a.start - b.start);

    // Remove overlapping matches (keep first one)
    const filteredMatches: Match[] = [];
    for (const match of allMatches) {
        const overlaps = filteredMatches.some(
            existing => match.start < existing.end && match.end > existing.start
        );
        if (!overlaps) {
            filteredMatches.push(match);
        }
    }

    // Build elements
    for (const match of filteredMatches) {
        // Add text before this match
        if (currentIndex < match.start) {
            elements.push(
                <span key={key++}>{line.slice(currentIndex, match.start)}</span>
            );
        }

        // Add the formatted element
        switch (match.type) {
            case 'bold':
                elements.push(<strong key={key++}>{match.content}</strong>);
                break;
            case 'italic':
                elements.push(<em key={key++}>{match.content}</em>);
                break;
            case 'code':
                elements.push(
                    <code key={key++} className="chat-inline-code">
                        {match.content}
                    </code>
                );
                break;
            case 'link':
                elements.push(
                    <a
                        key={key++}
                        href={match.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="chat-link"
                    >
                        {match.content}
                    </a>
                );
                break;
        }

        currentIndex = match.end;
    }

    // Add remaining text
    if (currentIndex < line.length) {
        elements.push(<span key={key++}>{line.slice(currentIndex)}</span>);
    }

    return elements.length > 0 ? elements : line;
}

export default parseMarkdown;
