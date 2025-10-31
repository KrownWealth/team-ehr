#!/bin/bash

# WeCareEHR Backend - Environment Setup Script

echo "🚀 Setting up WeCareEHR Backend environment..."

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# Generate JWT secrets
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)

# Create .env.local file
cat > .env.local <<EOF
# Generated on $(date)
NODE_ENV=development
PORT=8080
API_VERSION=v1

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wecareehr"

JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_REFRESH_EXPIRES_IN=30d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=your-app-password-here
FROM_EMAIL=noreply@wecareehr.local

FRONTEND_URL=http://localhost:3000

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

ENCRYPTION_KEY=$ENCRYPTION_KEY
EOF

echo "✅ .env.local created successfully!"
echo ""
echo "⚠️  IMPORTANT: Update these values in .env.local:"
echo "   - SMTP_USER: Your Gmail address"
echo "   - SMTP_PASSWORD: Your Gmail App Password"
echo ""
echo "📝 To get Gmail App Password:"
echo "   1. Go to https://myaccount.google.com/apppasswords"
echo "   2. Select 'Mail' and 'Other (Custom name)'"
echo "   3. Name it 'WeCareEHR Dev'"
echo "   4. Copy the 16-character password"
echo ""
echo "🗄️  Database Setup:"
echo "   Run: docker-compose up -d postgres"
echo "   Then: pnpm prisma migrate dev"
echo ""
echo "🎉 Ready to start development!"
echo "   Run: pnpm run dev"