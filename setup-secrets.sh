#!/bin/bash

# Script to test Docker container locally before deploying

set -e

echo "🧪 Testing Docker container locally..."

# Build the image
echo "📦 Building Docker image..."
docker build -t wecareehr-backend-test -f Dockerfile .

# Create .env.docker file for testing
cat > .env.docker <<EOF
NODE_ENV=production
PORT=8080
API_VERSION=v1
DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/wecareehr
JWT_SECRET=test-secret-minimum-32-characters-long
JWT_REFRESH_SECRET=test-refresh-secret-minimum-32-char
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=test@example.com
SMTP_PASSWORD=test-password
FROM_EMAIL=noreply@wecareehr.com
FRONTEND_URL=http://localhost:3000
GCP_PROJECT_ID=team-ehr
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
LOG_LEVEL=debug
EOF

echo "🚀 Starting container..."
docker run -d \
  --name wecareehr-test \
  -p 8080:8080 \
  --env-file .env.docker \
  wecareehr-backend-test

echo "⏳ Waiting 10 seconds for container to start..."
sleep 10

echo "📊 Container logs:"
docker logs wecareehr-test

echo ""
echo "🏥 Testing health endpoint..."
if curl -f http://localhost:8080/health; then
  echo ""
  echo "✅ Health check passed!"
else
  echo ""
  echo "❌ Health check failed!"
  echo "Container logs:"
  docker logs wecareehr-test
  docker stop wecareehr-test
  docker rm wecareehr-test
  exit 1
fi

echo ""
echo "🧹 Cleaning up..."
docker stop wecareehr-test
docker rm wecareehr-test

echo "✅ Docker test completed successfully!"
echo ""
echo "Ready to deploy to Cloud Run!"