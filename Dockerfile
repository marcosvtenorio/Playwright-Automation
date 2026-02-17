# ============================================
# Playwright Test Runner
# ============================================

FROM mcr.microsoft.com/playwright:v1.58.2-noble

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy test source
COPY tsconfig.json playwright.config.ts ./
COPY tests/ ./tests/

# Default: run all tests
CMD ["npx", "playwright", "test"]
