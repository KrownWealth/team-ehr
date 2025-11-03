# ---------- BUILD STAGE ----------
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@9

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY backend/package.json backend/pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY backend/src ./src/
COPY backend/tsconfig.json ./
COPY backend/nodemon.json ./

# Build TypeScript
RUN pnpm run build

# ---------- RUNTIME STAGE ----------
FROM node:18-alpine AS runtime

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# Copy built artifacts and minimal necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001 && \
  chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/server.js"]