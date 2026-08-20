# Single Unified Dockerfile for QQBikes Management System (Backend + Frontend)
FROM node:20-alpine AS builder

WORKDIR /app

# Install all dependencies (including devDependencies for TypeScript compilation)
COPY package*.json tsconfig.json ./
RUN npm install

# Copy application source code and Angular workspace configs
COPY angular.json tsconfig.app.json ./
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
RUN npm install --omit=dev

# Copy compiled backend and frontend assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/frontend ./frontend

EXPOSE 5000

CMD ["node", "dist/backend/src/server.js"]
