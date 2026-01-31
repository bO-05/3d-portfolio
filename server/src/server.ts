/**
 * Express Server for Jakarta Street Portfolio
 * Provides Gemini AI chat API with streaming and visitor counting
 * @module server
 * 
 * SDK: @google/genai (current, NOT deprecated @google/generative-ai)
 * Model: gemini-2.5-flash (1M context, better reasoning)
 */

// Load environment variables FIRST
import 'dotenv/config';

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { buildDeveloperSystemPrompt } from './developerContext';

// Environment variables
const PORT = process.env.PORT || 8080;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate API key
if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not set in environment variables');
    process.exit(1);
}

// ─────────────────────────────────────────────────────────────
// GEMINI SDK INITIALIZATION (Lazy for cold start optimization)
// ─────────────────────────────────────────────────────────────
let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
    if (!aiInstance) {
        aiInstance = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    }
    return aiInstance;
}

// In-memory visitor tracking
const visitors = new Set<string>();

// Create Express app
const app = express();

// ─────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────

// Security headers for embedding
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://dev.to");
    next();
});

// CORS
app.use(cors({
    origin: '*',
    credentials: true,
}));

// Parse JSON body
app.use(express.json());

// Rate limiting: 10 requests per minute per IP
const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: 'Too many requests, please wait a moment.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// ─────────────────────────────────────────────────────────────
// SYSTEM PROMPT BUILDER
// ─────────────────────────────────────────────────────────────

interface ChatContext {
    buildingId?: string;
    projects?: Array<{
        id: string;
        title: string;
        description: string;
        tech: string[];
    }>;
}

function buildSystemPrompt(userPrompt: string, context?: ChatContext): string {
    // Get the comprehensive developer context
    const developerContext = buildDeveloperSystemPrompt();

    return `${developerContext}

---

Current building location: ${context?.buildingId || 'street (general area)'}

Visitor's question: ${userPrompt}`;
}

// ─────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Visitor count endpoint
 */
app.get('/api/visitors/count', (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    visitors.add(ip);
    res.json({ count: visitors.size });
});

/**
 * Gemini AI chat endpoint (non-streaming)
 */
interface ChatRequest {
    prompt: string;
    context?: ChatContext;
}

app.post('/api/gemini/chat', chatLimiter, async (req: Request, res: Response) => {
    try {
        const { prompt, context } = req.body as ChatRequest;

        if (!prompt || typeof prompt !== 'string') {
            res.status(400).json({ error: 'Prompt is required' });
            return;
        }

        const ai = getAI();
        const systemPrompt = buildSystemPrompt(prompt, context);

        // Use new SDK API with gemini-2.5-flash
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: systemPrompt,
        });

        res.json({ response: response.text });
    } catch (error) {
        console.error('Gemini API error:', error);
        res.status(500).json({
            error: 'Failed to generate response',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Gemini AI streaming endpoint (SSE)
 * Returns tokens as they're generated for real-time chat experience
 */
app.post('/api/gemini/stream', chatLimiter, async (req: Request, res: Response) => {
    try {
        const { prompt, context } = req.body as ChatRequest;

        if (!prompt || typeof prompt !== 'string') {
            res.status(400).json({ error: 'Prompt is required' });
            return;
        }

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
        res.flushHeaders();

        const ai = getAI();
        const systemPrompt = buildSystemPrompt(prompt, context);

        // Use streaming API
        const response = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: systemPrompt,
        });

        // Stream tokens as SSE
        for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('Gemini streaming error:', error);

        // If headers already sent, write error as SSE
        if (res.headersSent) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
            res.end();
        } else {
            res.status(500).json({
                error: 'Failed to generate response',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
});

// ─────────────────────────────────────────────────────────────
// STATIC FILE SERVING (Production only)
// ─────────────────────────────────────────────────────────────

if (NODE_ENV === 'production') {
    // Serve Vite build
    const clientDistPath = path.join(__dirname, '../../client/dist');
    app.use(express.static(clientDistPath));

    // SPA fallback - serve index.html for all non-API routes
    app.get('*', (req: Request, res: Response) => {
        // Skip API routes
        if (req.path.startsWith('/api') || req.path === '/health') {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
}

// ─────────────────────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────────────────────

let server: ReturnType<typeof app.listen> | undefined;
let forceExitTimeout: NodeJS.Timeout | null = null;
let shutdownInProgress = false;

const shutdown = () => {
    // Prevent multiple shutdown calls
    if (shutdownInProgress) return;
    shutdownInProgress = true;

    console.log('Received shutdown signal, closing gracefully...');

    // If server hasn't started yet, just exit
    if (!server) {
        console.log('Server not yet started, exiting immediately');
        process.exit(0);
    }

    // Close the server gracefully
    server.close(() => {
        console.log('Server closed');
        if (forceExitTimeout) clearTimeout(forceExitTimeout);
        process.exit(0);
    });

    // Force exit after 10s if graceful close doesn't complete
    forceExitTimeout = setTimeout(() => {
        console.error('Forcing shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// ─────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────

server = app.listen(PORT, () => {
    console.log(`
🚀 Server running on http://localhost:${PORT}
📍 Health: http://localhost:${PORT}/health
💬 Chat: POST http://localhost:${PORT}/api/gemini/chat
🌊 Stream: POST http://localhost:${PORT}/api/gemini/stream
👥 Visitors: http://localhost:${PORT}/api/visitors/count
🌍 Environment: ${NODE_ENV}
  `);
});

export default app;
