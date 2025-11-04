# ---------- BUILD STAGE ----------
FROM node:18-alpine AS builder

RUN npm install -g pnpm@9
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy backend dependencies
COPY backend/package.json backend/pnpm-lock.yaml ./
COPY backend/src/prisma ./src/prisma/

RUN pnpm install --frozen-lockfile
RUN pnpm prisma generate --schema=src/prisma/schema.prisma

# Copy app source files
COPY backend/src ./src/
COPY backend/tsconfig.json ./
COPY backend/nodemon.json ./

RUN pnpm run build

# ---------- RUNTIME STAGE ----------
FROM node:18-alpine AS runtime

RUN npm install -g pnpm@9

WORKDIR /app

# Copy built artifacts and essential files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/src/prisma ./src/prisma

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Generate Prisma Client (install prisma temporarily)
RUN pnpm add -D prisma && \
  pnpm prisma generate --schema=src/prisma/schema.prisma && \
  pnpm remove prisma

COPY backend/start.sh ./start.sh
RUN chmod +x start.sh

RUN mkdir -p logs

RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001 && \
  chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["./start.sh"]