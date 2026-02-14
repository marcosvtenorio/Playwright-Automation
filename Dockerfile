# ============================================
# Playwright Test Runner — Multi-stage Docker
# ============================================

FROM mcr.microsoft.com/playwright:v1.52.0-noble AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy test source
COPY tsconfig.json playwright.config.ts ./
COPY tests/ ./tests/

# Default: run all tests
CMD ["npx", "playwright", "test"]

