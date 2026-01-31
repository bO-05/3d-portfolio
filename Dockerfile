# ═══════════════════════════════════════════════════════════════
# Stage 1: Build Client (Vite + React + Three.js)
# ═══════════════════════════════════════════════════════════════
FROM node:20-slim AS client-build

WORKDIR /app/client

# Copy package files first for better caching
COPY client/package*.json ./
RUN npm ci

# Copy source
COPY client ./

# Build-time environment variables for Vite (baked into bundle)
ENV VITE_CONVEX_URL=https://exciting-salmon-353.convex.cloud
ENV VITE_POSTHOG_API_KEY=phc_MzjjUTOUYPG9ogfveE0QS6WSxmMQYUhTRV24QPGky0Z
ENV VITE_POSTHOG_HOST=https://us.i.posthog.com
ENV VITE_SENTRY_DSN=https://d63129d491a0590a4c3ff657c7fff521@o4509376643465216.ingest.us.sentry.io/4510686650105856
ENV VITE_API_URL=/api

RUN npm run build

# ═══════════════════════════════════════════════════════════════
# Stage 2: Build Server (Express + TypeScript)
# ═══════════════════════════════════════════════════════════════
FROM node:20-slim AS server-build

WORKDIR /app/server

# Copy package files first for better caching
COPY server/package*.json ./
RUN npm ci

# Copy source and build
COPY server ./
RUN npm run build

# ═══════════════════════════════════════════════════════════════
# Stage 3: Production (Minimal Runtime)
# ═══════════════════════════════════════════════════════════════
FROM node:20-slim

WORKDIR /app

# Copy built client assets
COPY --from=client-build /app/client/dist ./client/dist

# Copy server dist and production dependencies
COPY --from=server-build /app/server/dist ./server/dist
COPY --from=server-build /app/server/node_modules ./server/node_modules

# Set working directory for server (needed for relative path ../../client/dist)
WORKDIR /app/server

# Cloud Run configuration
ENV PORT=8080 NODE_ENV=production
EXPOSE 8080

# Security: run as non-root user
USER node

# Start Express server
CMD ["node", "dist/server.js"]
