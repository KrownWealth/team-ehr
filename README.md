# wecareEHR Backend Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- GCP account with $300 credits activated
- PostgreSQL database (Cloud SQL or local)
- Firebase project created

### Environment Setup

1. **Clone and Install**
```bash
git clone <repository-url>
cd wecareehr/backend
npm install
```

2. **Configure Environment Variables**

Create `.env` file:
```env
# Server
NODE_ENV=development
PORT=8080
API_VERSION=v1
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/wecareehr

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this
JWT_REFRESH_EXPIRES_IN=30d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@wecareehr.com

# GCP
GCP_PROJECT_ID=your-project-id
GCP_BUCKET_NAME=wecareehr-storage
GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json

# External APIs
NIN_API_URL=https://nin-validation-api.gov.ng
NIN_API_KEY=your-nin-api-key
AI_DIAGNOSIS_FUNCTION_URL=https://your-region-your-project.cloudfunctions.net/ai-diagnosis

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Encryption
ENCRYPTION_KEY=your-32-char-encryption-key-here
```

3. **GCP Service Account Setup**

```bash
# Create service account
gcloud iam service-accounts create wecareehr-backend \
  --display-name="WeCareEHR Backend Service"

# Grant permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:wecareehr-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:wecareehr-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/pubsub.editor"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:wecareehr-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

# Download key
gcloud iam service-accounts keys create ./gcp-credentials.json \
  --iam-account=wecareehr-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

4. **Database Setup**

```bash
# Run Prisma migrations
npx prisma generate
npx prisma migrate deploy

# Seed database (optional)
npm run seed
```

5. **Create GCP Resources**

```bash
# Cloud Storage buckets
gsutil mb -l us-central1 gs://YOUR_PROJECT_ID-patient-photos
gsutil mb -l us-central1 gs://YOUR_PROJECT_ID-lab-results
gsutil mb -l us-central1 gs://YOUR_PROJECT_ID-reports

# Pub/Sub topics
gcloud pubsub topics create patient-registered
gcloud pubsub topics create consultation-completed
gcloud pubsub topics create payment-received
gcloud pubsub topics create lab-result-ready

# BigQuery dataset
bq mk --dataset YOUR_PROJECT_ID:wecareehr_analytics

# Create tables
bq mk --table YOUR_PROJECT_ID:wecareehr_analytics.patient_visits \
  patient_id:STRING,clinic_id:STRING,visit_date:TIMESTAMP,diagnosis:STRING,amount:FLOAT

bq mk --table YOUR_PROJECT_ID:wecareehr_analytics.vitals_trends \
  patient_id:STRING,recorded_at:TIMESTAMP,bp_systolic:INTEGER,bp_diastolic:INTEGER,temperature:FLOAT
```

---

## 📦 Local Development

### Run Development Server
```bash
npm run dev
```

Server runs on `http://localhost:8080`

### Run Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Database Management
```bash
# Create migration
npx prisma migrate dev --name add_new_field

# View database
npx prisma studio

# Reset database
npx prisma migrate reset
```

---

## 🌐 Production Deployment (GCP Cloud Run)

### 1. Build Docker Image

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
```

Create `.dockerignore`:
```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
```

### 2. Deploy to Cloud Run

```bash
# Build and push image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/wecareehr-backend

# Deploy to Cloud Run
gcloud run deploy wecareehr-backend \
  --image gcr.io/YOUR_PROJECT_ID/wecareehr-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60s \
  --max-instances 10 \
  --min-instances 0 \
  --set-env-vars NODE_ENV=production \
  --set-env-vars DATABASE_URL=YOUR_CLOUD_SQL_CONNECTION \
  --set-env-vars GCP_PROJECT_ID=YOUR_PROJECT_ID \
  --service-account wecareehr-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 3. Connect to Cloud SQL

```bash
# Create Cloud SQL instance
gcloud sql instances create wecareehr-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create wecareehr --instance=wecareehr-db

# Create user
gcloud sql users create wecareehr-user \
  --instance=wecareehr-db \
  --password=YOUR_SECURE_PASSWORD

# Update Cloud Run to use Cloud SQL
gcloud run services update wecareehr-backend \
  --add-cloudsql-instances YOUR_PROJECT_ID:us-central1:wecareehr-db
```

---

## 🔧 Cost Optimization

### Budget Alerts
```bash
# Set billing alert at $50
gcloud alpha billing budgets create \
  --billing-account YOUR_BILLING_ACCOUNT \
  --display-name "WeCareEHR Budget Alert" \
  --budget-amount 50USD \
  --threshold-rule percent=50 \
  --threshold-rule percent=90 \
  --threshold-rule percent=100
```

### Resource Limits
- Cloud Run: max 10 instances, scale to zero enabled
- Cloud SQL: db-f1-micro (smallest instance)
- Storage: Lifecycle rules to delete old files after 90 days
- Firestore: Limit document reads with pagination

### Monitoring
```bash
# Enable Cloud Monitoring
gcloud services enable monitoring.googleapis.com

# Create uptime check
gcloud monitoring uptime-checks create https://YOUR_CLOUD_RUN_URL/health \
  --display-name="WeCareEHR Health Check"
```

---

## 🔐 Security Checklist

- [ ] Change all default passwords and secrets
- [ ] Enable Cloud Armor for DDoS protection (optional, costs extra)
- [ ] Set up VPC for Cloud SQL (production only)
- [ ] Enable Cloud IAM audit logging
- [ ] Rotate service account keys every 90 days
- [ ] Enable encryption at rest for Cloud SQL
- [ ] Use Secret Manager for sensitive environment variables
- [ ] Set up Cloud KMS for additional encryption (if needed)

---

## 📊 Monitoring & Logging

### View Logs
```bash
# Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=wecareehr-backend" --limit 50

# Error logs only
gcloud logging read "resource.type=cloud_run_revision AND severity=ERROR" --limit 20
```

### Metrics to Monitor
- Request count per minute
- Error rate (5xx responses)
- Response latency (p50, p95, p99)
- Database connection pool usage
- Memory usage
- CPU usage
- Cost per day

---

## 🆘 Troubleshooting

### Issue: Database Connection Fails
```bash
# Test Cloud SQL connection
gcloud sql connect wecareehr-db --user=wecareehr-user

# Check Cloud Run service account permissions
gcloud projects get-iam-policy YOUR_PROJECT_ID
```

### Issue: Cloud Run Out of Memory
```bash
# Increase memory allocation
gcloud run services update wecareehr-backend --memory 1Gi
```

### Issue: Too Many Firestore Reads
- Enable client-side caching
- Implement pagination on list endpoints
- Use Cloud Functions for background tasks instead of polling

### Issue: High Costs
```bash
# Check current spending
gcloud billing accounts list
gcloud billing accounts describe YOUR_BILLING_ACCOUNT

# Identify expensive services
gcloud logging read "protoPayload.serviceName:*" --format=json | jq '.[] | select(.severity=="INFO")'
```

---

## 📝 Post-Deployment Tasks

1. **Test All Critical Endpoints**
   - Run integration test suite against production
   - Verify sync endpoint works offline → online
   - Test multi-tenancy isolation

2. **Set Up Monitoring Alerts**
   - Error rate > 5%
   - Response latency > 2s
   - Daily cost > $5

3. **Create Backup Schedule**
   ```bash
   # Automated Cloud SQL backups
   gcloud sql instances patch wecareehr-db \
     --backup-start-time=02:00 \
     --retained-backups-count=7
   ```

4. **Document API**
   - Generate Swagger docs
   - Update Postman collection
   - Share with frontend team

---

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ Health check returns 200 OK
- ✅ User can register → verify → login
- ✅ Clinic can be onboarded
- ✅ Patient can be registered offline
- ✅ Sync endpoint processes offline actions
- ✅ Multi-tenancy prevents cross-clinic access
- ✅ Daily cost is under $5 ($150/month)
- ✅ All integration tests pass

---

## 📞 Support

For deployment issues:
1. Check Cloud Run logs: `gcloud logging read`
2. Verify environment variables are set
3. Test database connectivity
4. Review GCP IAM permissions

**Remember**: The system must work offline-first. Test disconnecting network during critical workflows!