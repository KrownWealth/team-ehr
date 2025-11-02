#!/bin/bash

# WeCareEHR - Setup Google Cloud Secrets
# Run this script to create all required secrets in Secret Manager

PROJECT_ID="team-ehr"

echo "🔐 Setting up secrets for project: $PROJECT_ID"
echo ""

# Function to create or update secret
create_or_update_secret() {
  local secret_name=$1
  local secret_value=$2
  
  # Check if secret exists
  if gcloud secrets describe $secret_name --project=$PROJECT_ID &>/dev/null; then
    echo "✓ Secret $secret_name already exists"
    read -p "  Update it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo -n "$secret_value" | gcloud secrets versions add $secret_name \
        --data-file=- \
        --project=$PROJECT_ID
      echo "  ✓ Updated"
    fi
  else
    echo -n "$secret_value" | gcloud secrets create $secret_name \
      --data-file=- \
      --project=$PROJECT_ID
    echo "✓ Created $secret_name"
  fi
}

# Create SMTP_USER secret
echo "📧 SMTP Configuration"
read -p "Enter SMTP_USER (Gmail address): " smtp_user
create_or_update_secret "SMTP_USER" "$smtp_user"

# Create SMTP_PASSWORD secret
read -sp "Enter SMTP_PASSWORD (Gmail App Password): " smtp_password
echo
create_or_update_secret "SMTP_PASSWORD" "$smtp_password"

# Create DATABASE_URL secret
echo ""
echo "🗄️  Database Configuration"
read -p "Enter DATABASE_URL: " database_url
create_or_update_secret "DATABASE_URL" "$database_url"

# Generate JWT secrets if they don't exist
echo ""
echo "🔑 JWT Secrets"
if ! gcloud secrets describe JWT_SECRET --project=$PROJECT_ID &>/dev/null; then
  jwt_secret=$(openssl rand -base64 32)
  create_or_update_secret "JWT_SECRET" "$jwt_secret"
else
  echo "✓ JWT_SECRET already exists"
fi

if ! gcloud secrets describe JWT_REFRESH_SECRET --project=$PROJECT_ID &>/dev/null; then
  jwt_refresh_secret=$(openssl rand -base64 32)
  create_or_update_secret "JWT_REFRESH_SECRET" "$jwt_refresh_secret"
else
  echo "✓ JWT_REFRESH_SECRET already exists"
fi

# Generate ENCRYPTION_KEY if it doesn't exist
echo ""
echo "🔐 Encryption Key"
if ! gcloud secrets describe ENCRYPTION_KEY --project=$PROJECT_ID &>/dev/null; then
  encryption_key=$(openssl rand -hex 32)
  create_or_update_secret "ENCRYPTION_KEY" "$encryption_key"
else
  echo "✓ ENCRYPTION_KEY already exists"
fi

# Grant Cloud Run access to secrets
echo ""
echo "🔓 Granting Cloud Run access to secrets..."
SERVICE_ACCOUNT="$PROJECT_ID@$PROJECT_ID.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet

echo ""
echo "✅ Secrets setup complete!"
echo ""
echo "📝 Summary of secrets created:"
gcloud secrets list --project=$PROJECT_ID --filter="name:DATABASE_URL OR name:JWT_SECRET OR name:JWT_REFRESH_SECRET OR name:SMTP_USER OR name:SMTP_PASSWORD OR name:ENCRYPTION_KEY"