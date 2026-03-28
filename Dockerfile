# G0DM0D3 Unified Deployment
# Build both the Next.js frontend and the Node.js API to run in a single container.
# This ensures that the root URL serves the website, and /v1/ serves the API.

# ── Stage 1: Build the UI ───────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Copy all source
COPY . .

# Build Next.js app (outputs to the 'out' directory due to 'output: export')
ENV NODE_ENV=production
RUN npm run build --legacy-peer-deps

# ── Stage 2: Final Image ────────────────────────────────────
FROM node:20-slim

WORKDIR /app

# Copy built frontend (for serving statically from Express)
COPY --from=builder /app/out ./out

# Install production API dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --legacy-peer-deps 2>/dev/null || npm install --omit=dev --legacy-peer-deps

# Copy API source code
COPY api/ ./api/
COPY src/lib/ ./src/lib/
COPY src/stm/ ./src/stm/

# Install tsx globally or as an alias (we use npx in the CMD)

# Environment setup
ENV PORT=7860
EXPOSE 7860

# Non-root user for security
RUN addgroup --system app && adduser --system --ingroup app app
RUN chown -R app:app /app
USER app

# Health check (API check still works!)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:7860/v1/health || exit 1

# Start the unified server
CMD ["npx", "tsx", "api/server.ts"]
