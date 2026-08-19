# Single Unified Dockerfile for QQBikes Management System (Backend + Frontend)
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy application source code
COPY backend ./backend
COPY frontend ./frontend

# Compile TypeScript
RUN npm run build

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm ci --only=production

# Copy compiled backend and frontend assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend ./frontend

EXPOSE 5000

CMD ["npx", "tsx", "backend/src/server.ts"]
