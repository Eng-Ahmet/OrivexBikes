#!/usr/bin/env bash

# ==============================================================================
# QQBikes Clean Rebuild & Container Maintenance Script
# ==============================================================================
# This script performs a complete clean-up of Docker containers, project caches,
# npm cache, and performs a fresh reinstall and container rebuild.
# ==============================================================================

set -e

echo "🚀 Starting QQBikes Clean Rebuild & Maintenance..."

# 1. Stop and remove existing project Docker containers, networks, and orphans
echo "🧹 Stopping and removing existing QQBikes containers..."
if docker compose ps -q | grep -q .; then
  docker compose down --remove-orphans
else
  echo "ℹ️ No running QQBikes containers found."
fi

# Remove any lingering qqbikes containers if present
if [ "$(docker ps -aq -f name=qqbikes)" ]; then
  echo "🧹 Removing lingering QQBikes containers..."
  docker rm -f $(docker ps -aq -f name=qqbikes)
fi

# 2. Clean npm cache locally
echo "🧽 Cleaning local npm cache..."
npm cache clean --force

# 3. Clean Docker builder cache & dangling images
echo "🗑️ Cleaning Docker builder cache & dangling images..."
docker builder prune -f || true
docker image prune -f --filter "label=qqbikes" || true

# 4. Install npm dependencies
echo "📦 Installing npm packages..."
npm install

# 5. Build and start Docker containers with fresh cache
echo "🏗️ Rebuilding Docker containers without cache..."
docker compose build --no-cache

echo "⚡ Starting Docker containers in background..."
docker compose up -d

echo ""
echo "=================================================="
echo "✅ QQBikes Clean Rebuild & Container Deployment Complete!"
echo "=================================================="
