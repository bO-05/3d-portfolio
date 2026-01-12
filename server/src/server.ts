/**
 * Express Server for Jakarta Street Portfolio
 * Provides Gemini AI chat API and visitor counting
 * @module server
 */

// Load environment variables FIRST
import 'dotenv/config';

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Environment variables (now loaded from .env)
const PORT = process.env.PORT || 8080;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini AI
if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not set in environment variables');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// In-memory visitor tracking
const visitors = new Set<string>();

// Create Express app
const app = express();

// ─────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────

// CRITICAL: CSP headers for dev.to embedding
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://dev.to");
    next();
});

// CORS - allow all origins in development
app.use(cors({
    origin: '*',
    credentials: true,
}));

// Parse JSON body
app.use(express.json());

// Rate limiting: 10 requests per minute per IP
const chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: { error: 'Too many requests, please wait a moment.' },
    standardHeaders: true,
    legacyHeaders: false,
});

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
 * Gemini AI chat endpoint
 */
interface ChatRequest {
    prompt: string;
    context?: {
        buildingId?: string;
        projects?: Array<{
            id: string;
            title: string;
            description: string;
            tech: string[];
        }>;
    };
}

app.post('/api/gemini/chat', chatLimiter, async (req: Request, res: Response) => {
    try {
        const { prompt, context } = req.body as ChatRequest;

        if (!prompt || typeof prompt !== 'string') {
            res.status(400).json({ error: 'Prompt is required' });
            return;
        }

        // Build system prompt with context
        const systemPrompt = `You are a friendly AI assistant at a virtual Jakarta street portfolio website. 
You're helping visitors learn about the developer who created this portfolio.

Current location: ${context?.buildingId || 'street'}

${context?.projects ? `
The developer has built these projects:
${JSON.stringify(context.projects, null, 2)}
` : ''}

Instructions:
- Be helpful, friendly, and conversational
- Answer questions about the developer's projects and skills
- Use Indonesian expressions occasionally (like "Halo!", "Terima kasih!")
- Keep responses concise (under 200 words)
- If asked about something not in your context, politely say you don't know

Visitor's question: ${prompt}`;

        // Generate response
        const result = await model.generateContent(systemPrompt);
        const response = result.response;
        const text = response.text();

        res.json({ response: text });
    } catch (error) {
        console.error('Gemini API error:', error);
        res.status(500).json({
            error: 'Failed to generate response',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// ─────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`
🚀 Server running on http://localhost:${PORT}
📍 Health: http://localhost:${PORT}/health
💬 Chat: POST http://localhost:${PORT}/api/gemini/chat
👥 Visitors: http://localhost:${PORT}/api/visitors/count
  `);
});

export default app;
