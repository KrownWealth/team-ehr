# wecareEHR - Electronic Health Records System
---

# 1.0 Business Value & Strategy (The "Why")

## 1.1 Problem Statement and Use Case Definition

### Identify Pain Point

Healthcare facilities across Nigeria and Sub-Saharan Africa faces a critical digitization crisis, where 98% of clinics still rely on paper-based patient records, leading to:


- 30-40% of patient files lost or misfiled annually
- Long patient wait times due to manual queue tracking, causing patient dissatisfaction and operational bottlenecks
- Medical errors due to illegible handwriting and incomplete patient history
- Zero continuity of care when patients visit different facilities
- No data infrastructure for public health surveillance and epidemic response
- Limited healthcare workforce unable to leverage technology, and AI for efficiency
- Patients unable to access their own health data, follow up on appointments, or receive medication reminders


### Industry Context

**Target Industry**:  Healthcare Technology (HealthTech): Primary Healthcare Centers, General Hospitals, and Private Clinics in Nigeria

**Target User Personas**:
1. **Clinic Administrators**: Sign-up on the platform, onboard clinic, manage staff, configure clinic settings, monitor operations
2. **Front Desk Clerks**: Handle patient registration, view/edit patient data, and queue management
3. **Nurses**: Access to complete patient histories, record patient vitals, triage, manage patient flow, AI-powered clinical decision support
4. **Doctors**: Conduct consultations, prescribe medications, order lab tests
5. **Patients**: Access personal health records, schedule appointments, receive prescriptions

### Current State
Today, healthcare facilities in low-resource settings operate with:

- Paper-based systems: Physical folders stored in filing cabinets, prone to damage, loss, and unauthorized access
- Manual processes: Staff spending 40%+ of their time on administrative tasks instead of patient care
- Fragmented care: No way to share patient information between facilities, leading to redundant tests and missed diagnoses
- No data insights: Unable to track health trends, manage inventory, or optimize operations
- Zero patient engagement: Patients have no visibility into their own health data

**Why Current Methods Are Failing:**
- Damage and Theft: Patient records get lost or damaged
- Scalability Crisis: Paper systems cannot handle growing patient volumes
- Quality of Care: Incomplete patient histories lead to medical errors and suboptimal treatment
- Operational Inefficiency: Average patient wait time exceeds 2-3 hours in busy clinics, manual processes create bottlenecks, long wait times
- Zero Accountability: No audit trail for medical decisions or data access
- Public Health Blind Spot: No aggregated data for disease surveillance or epidemic response


---

## 1.2 Solution Summary and Value Proposition

### High-Level Overview
**WeCareEHR** is a cloud-based, mobile-first, and multi-tenant Electronic Health Record (EHR) system designed specifically for low-resource healthcare settings. Built on Google Cloud infrastructure, the platform digitizes the entire patient care journey—from registration through consultation with AI-powered clinical decision support via Vertex AI (Gemini), wecareEHR transforms how African clinics deliver care.

The system implements a **role-based access workflow** where each user type (Admin, Clerk, Nurse, Doctor, Patient) has tailored interfaces and capabilities that mirror real-world clinical workflows.

### Core Metrics (Estimated Value Proposition)

#### Efficiency Gains:

| Metric | Current State | With WeCareEHR | Improvement |
|--------|---------------|----------------|-------------|
| **Patient Registration Time/File Retriecal** | 15-20 minutes | 2-4 minutes | **75% reduction** |
| **Queue Wait Time** | 2-3 hours | 45-60 minutes | **60% reduction** |
| **Prescription Error Rate** | 15-20% | <2% | **90% reduction** |
| **Billing Accuracy** | 75-80% | 98%+ | **23% improvement** |
| **Patient Record Retrieval** | 10-15 minutes | <5 seconds | **99% reduction** |
| **Clinical Documentation Time** | 20-30 minutes | 10-15 minutes | **50% reduction** |


#### Cost Reduction:

- $0.50 per patient visit in operational costs (vs. $0-$5 for Western EHR systems)
- 70% lower total cost of ownership compared to traditional EHR solutions
- Eliminates costs associated with paper storage, printing, and physical file management
- Reduces medical errors by 35%, avoiding costly malpractice and repeated treatments

#### Revenue Impact:

- 25% increase in patient throughput capacity (more patients served per day)
- 15% improvement in patient retention through better care coordination
- New revenue streams: Telemedicine capabilities, health insurance integration
- Clinic growth enabler: Digital infrastructure supports expansion to multiple locations


### Key Differentiators & Innovation

1. **AI-Powered Diagnostic Support**: 

- Novel RAG Implementation: Uses Vertex AI (Gemini 2.0 Flash) to analyze patient context (demographics, chronic conditions, allergies, recent vitals) and provide structured diagnosis suggestions and recommendations
- Real-time Drug Interaction Checking: Prevents prescription errors by cross-referencing patient allergies
- Vital Signs Intelligence: Automated flagging system that categorizes vital abnormalities as CRITICAL or WARNING, ensuring immediate attention to high-risk patients
- Contextual Recommendations: AI considers local disease prevalence and available treatments

2. **Multi-Tenant Architecture**: 

- Strict tenant isolation ensures clinic data never mingles. Single deployment serves multiple clinics with complete data isolation, reducing infrastructure costs while maintaining security
- Role-Based Access Control (RBAC) at every API endpoint
- Patient data encrypted at rest (Cloud SQL) and in transit (SSL/TLS)
- Complies with NDPR (Nigeria Data Protection Regulation)


3. **Patient Empowerment Portal**

- First African EHR to provide patients direct access to their health data
- Self-service vitals recording for chronic disease management
- Medication reminders and appointment scheduling
- Personalized health tips based on patient conditions

4. **Hyper-Scalable Cloud Infrastructure**

- Built on Google Cloud Run (serverless), scales from 10 to 10,000 patients seamlessly
- Pay-per-use model eliminates upfront infrastructure costs
- Auto-scales during peak hours, scales to zero during off-hours

5. **Africa-First Design Philosophy**

- Built specifically for low-bandwidth, intermittent connectivity environments.
- Mobile-first interface optimized for smartphone access. 
- Pricing model accessible to small clinics ($20-50/month vs. $500+ for Western alternatives)


### End-User Experience Walkthrough

#### **Admin Workflow**
```
Registration → Email Verification (OTP) → Clinic Onboarding → Configure Settings → Invite Staff Members → Monitor Dashboard
```

#### **Clerk Workflow**
```
Receive Email Invitation → Login with Temp Password → 
Change Password → Register Patients → Manage Queue → 
Schedule Appointments 
```

#### **Nurse Workflow**
```
Login → View Queue → Call Next Patient → 
Record Vitals (BP, Temp, Pulse, SpO2, Weight, Height) → 
Review Auto-Generated Flags → Update Queue Status
```

#### **Doctor Workflow**
```
Login → View Queue/Appointments → Start Consultation → 
Review Patient History & Vitals → Get AI Diagnostic Suggestions → 
Document SOAP Notes → Prescribe (with allergy check) → 
Set Follow-up → Complete Visit
```

#### **Patient Workflow**
```
Request OTP via Email/Phone → Verify & Login → 
View Dashboard (Health Summary, Appointments, Vitals) → 
Access Medical Records → View Prescriptions & Health Tips
```

### Core Features Showcase

1. **Smart Patient Registration & Queue Management**
   - Auto-generated unique patient numbers (PAT-00001 format)
   - Priority-based queue system with real-time status updates (emergency vs. routine)
   - Live status updates (Waiting → In Consultation → Completed)
   - Appointment scheduling with conflict detection

2. **AI-Powered Clinical Decision Support**
   - Analyzes patient symptoms, vitals, medical history, and demographics
   - Suggests probable diagnoses with confidence levels and ICD-10 codes
   - Provides evidence-based treatment recommendations
   - Flags red flags requiring urgent intervention
   - Vital signs trend analysis with predictive risk assessment
   - Cardiovascular and diabetes risk scoring

3. **Intelligent Drug Allergy Checking**
   - Real-time cross-referencing of prescribed medications against patient allergy profiles
   - Alerts doctors before prescription is finalized
   - Prevents adverse drug reactions and potential fatalities

3. **Comprehensive Consultation Documentation**
   - SOAP note format (Subjective, Objective, Assessment, Plan)
   - Integrated prescription management with dosage guidance
   - Lab order tracking
   - Follow-up scheduling

4. **Intelligent Vital Signs Monitoring**
   - Automated and Real-time BMI calculation
   - Automated critical value alerting (CRITICAL_BP_HIGH, WARNING_TEMP_HIGH, etc.)
   - Historical trend visualization

5. **Patient Self-Service Portal**
   - Secure OTP-based passwordless authentication
   - Personal health record access
   - Appointment viewing 
---


# 2.0 Technical Deep Dive & Architecture (The "How")

## 2.1 System Architecture and Data Flow

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js)                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │ Admin Portal│ │ Staff Portal│ │Doctor Portal│ │    Patient Portal       ││
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └───────────┬─────────────┘│
└─────────┼───────────────┼───────────────┼───────────────────┼───────────────┘
          │               │               │                   │
          ▼               ▼               ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY (Express.js)                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      Middleware Stack                                  │   │
│  │  ┌─────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌───────────┐ │   │
│  │  │ Helmet  │ │   CORS   │ │Rate Limiter│ │   Auth   │ │  Tenant   │ │   │
│  │  │(Security)│ │          │ │            │ │  (JWT)   │ │ Isolation │ │   │
│  │  └─────────┘ └──────────┘ └────────────┘ └──────────┘ └───────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│  ┌─────────────────────────────────┼─────────────────────────────────────┐  │
│  │                          Route Handlers                                │  │
│  │ /auth /clinic /patient /queue /vitals /consultation /ai /prescription │  │
│  └─────────────────────────────────┼─────────────────────────────────────┘  │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          ▼                          ▼                          ▼
┌─────────────────┐      ┌─────────────────────┐      ┌─────────────────┐
│   DB LAYERS     │      │   Google Cloud      │      │  Email Service  │
│  (Prisma ORM)   │      │                     |      |                 |
|                 |      |                     |      |   (Nodemailer)  |
|   Cloud SQL     |      |                     |      |                 |
|  (PostgreSQL)   |      |     Cloud Build     |      |                 | 
|                 │      │                     │      |                 |
│  TABLES         │      │ ┌─────────────────┐ │      │                 │
│ • Users         │      │ │  Gemini 2.0     │ │      │ • OTP Delivery  │
│ • Clinics       │      │ │  Flash API      │ │      │ • Invitations   │
│ • Patients      │      │ │  (AI Diagnosis) │ │      │ • Appointments  │
│ • Vitals        │      │ └─────────────────┘ │      │                 │
│ • Consultations │      │ ┌─────────────────┐ │      │                 │
│ • Appointments  │      │ │  Cloud Storage  │ │      └─────────────────┘
│ • Bills         │      │ │  (File Upload)  │ │
│ • Queue         │      │ └─────────────────┘ │
│ • OTPs          │      │ ┌─────────────────┐ │
└─────────────────┘      │ │  Pub/Sub        │ │
                         │ │(Appointments    | | 
                         | | Notification)   │ |
                         │ └─────────────────┘ │
                         │ ┌─────────────────┐ │
                         │ │ Secret Manager  │ │
                         │ │ (Credentials)   │ │
                         │ └─────────────────┘ │
                         └─────────────────────┘
```

### Data Path Narrative

**Example Flow: AI-Powered Diagnosis Suggestion**

**Scenario:** Doctor Creates/Get AI-Powered Diagnosis

1. **User Action:**

- Doctor login intto wecareEHR web application
- Get a patient from the queue (WAITING) 
- See patient vitals and records 
- Ask questions from the patient and fills consultation form in SOAP order (subjective, objective, assessment,plan)
- Clicks "Get AI Diagnosis Suggestions"


2. **Authentication Flow**: 

- Client sends POST request via /api/v1/ai/diagnose with JWT in Authorization header
- Request hits Cloud Run backend (Express.js)
- Authenticate middleware validates JWT 
- Validated and authorize via `auth.middleware.ts` → User role verified (must be DOCTOR)
- TenantIsolation middleware extracts clinicId from user tokenRequest hits Express.js backend → JWT token - - -  

3. **Tenant Isolation**: `tenant.middleware.ts` ensures doctor can only access patients within their designated clinic

4. **Patient Context Assembly**: 
   - Fetch patient demographics from PostgreSQL
   - Retrieve last 3 vital recordings
   - Pull last 5 consultation histories
   - Compile chronic conditions and allergies

5. **AI Processing**:
   ```
   Request → Google GenAI SDK → Gemini 2.0 Flash Model
   
   Prompt includes:
   - Patient age, gender, blood group
   - Chronic conditions & allergies
   - Current symptoms & chief complaint
   - Recent vital signs with flags
   - Medical history summary
   ```

6. **Response Processing**:
   - Parse JSON response from Gemini
   - Extract differential diagnoses with probability levels
   - Identify recommended tests
   - Flag red flags requiring immediate attention
   - Generate management suggestions

7. **Return to Client**: Structured response with AI suggestions + disclaimer about clinical judgment

---

## 2.2 Technology Stack and Google Cloud Services

### Core Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Node.js (v20+) | Server-side JavaScript execution |
| **Framework** | Express.js 4.21.2 | REST API framework |
| **Language** | TypeScript 5.9.3 | Type-safe development |
| **ORM** | Prisma 6.19 | Database abstraction & migrations |
| **Database** | PostgreSQL | Primary data storage |
| **Authentication** | JWT (jsonwebtoken) | Stateless authentication |
| **Validation** | express-validator, Joi | Request validation |
| **Security** | Helmet, bcryptjs | Security headers & password hashing |
| **Logging** | Winston | Structured logging |
| **Email** | Nodemailer | Transactional emails |

### Google Cloud & Other Technologies Breakdown

#### **Generative AI**
| Service | Implementation | Purpose |
|---------|----------------|---------|
| **Google GenAI SDK** (`@google/genai` v0.8.0) | `ai.controller.ts` | AI-powered clinical decision support |
| **Model: Gemini 2.0 Flash** | `gemini-2.0-flash` | Fast, accurate differential diagnosis generation |

**AI Features Implemented**:
- `getDiagnosisSuggestions()`: Generates differential diagnoses with ICD-10 codes
- `checkDrugInteractions()`: Validates medication safety
- `analyzeVitalsTrends()`: Identifies concerning vital sign patterns
- `assessPatientRisk()`: Calculates cardiovascular and diabetes risk scores

#### **Infrastructure & Compute**
| Service | Configuration | Purpose |
|---------|---------------|---------|
| **Cloud Run** | Auto-scaling, PORT 8080 | Serverless container hosting |
| **Cloud Storage** (`@google-cloud/storage` v7.17) | `gcp.ts` | Patient photos, documents |

#### **Messaging & Events**
| Service | Implementation | Purpose |
|---------|----------------|---------|
| **Cloud Pub/Sub** (`@google-cloud/pubsub` v5.2) | `pubsub.service.ts` | Async appointment notifications |

**Topics**:
- `appointment-notifications`: Triggers email for scheduled/cancelled appointments

#### **Security & Secrets**
| Service | Implementation | Purpose |
|---------|----------------|---------|
| **Secret Manager** (`@google-cloud/secret-manager` v6.1) | `gcp.ts` | API keys, credentials storage |

#### **Data & Storage**
| Service | Implementation | Purpose |
|---------|----------------|---------|
| **Cloud SQL (PostgreSQL)** | Prisma ORM connection | Production database |

#### **Additional Google Cloud Services (Configured)**
| Service | Status | Purpose |
|---------|--------|---------|
| **Vertex AI** (`@google-cloud/vertexai` v1.10) | Configured | Future ML model deployment |
| **Firestore** (`@google-cloud/firestore` v7.11) | `database.service.ts` | Prepared for offline data storage, and audit logs (optional) |

### Database Schema Overview

```prisma
// Core Entities
Clinic (Multi-tenant root)
  ├── User (Staff accounts)
  ├── Patient (Patient records)
  │     ├── Vitals (Health measurements)
  │     ├── Consultation (Doctor visits)
  │     ├── Appointment (Scheduled visits)
  │     ├── Bill (Financial records)
  │     └── Queue (Wait list entries)
  └── OTP (Verification codes)

// Enums
UserRole: ADMIN | DOCTOR | NURSE | CLERK | PATIENT
Gender: MALE | FEMALE | OTHER
AppointmentStatus: SCHEDULED | CHECKED_IN | IN_CONSULTATION | COMPLETED | CANCELLED
BillStatus: PENDING | PARTIAL | PAID | CANCELLED
QueueStatus: WAITING | IN_CONSULTATION | COMPLETED | CANCELLED
```

### API Endpoints Summary

| Module | Endpoints | Key Operations |
|--------|-----------|----------------|
| **Auth** | 12 | Register, Login, OTP, Password Reset, Patient Auth |
| **Admin** | 4 | Profile, Dashboard Stats |
| **Clinic** | 5 | Onboard, Settings, Profile |
| **Staff** | 7 | CRUD, Activate/Deactivate |
| **Patient** | 4 | Register, Search, Update |
| **Vitals** | 4 | Record, History, Flags |
| **Consultation** | 5 | Create, Update, History |
| **Prescription** | 6 | Create, Allergy Check |
| **Queue** | 5 | Add, Status, Next Patient |
| **Appointment** | 9 | CRUD, Check-in, Complete |
| **AI** | 4 | Diagnosis, Drug Interactions, Risk Assessment |
| **Patient Portal** | 6 | Dashboard, Self-Vitals, Records |

---

# 3.0 Operational Readiness & Commercial Model

## 3.1 Cloud Cost Analysis

### Commercial Model: Tiered SaaS Subscription

| Tier | Target | Monthly Price (NGN) | Included |
|------|--------|---------------------|----------|
| **Starter** | Small Clinics (<5 staff) | ₦50,000 | 500 patients, 5 users, Basic features |
| **Professional** | Medium Clinics (5-20 staff) | ₦150,000 | 2,000 patients, 20 users, AI features |
| **Enterprise** | Hospitals (20+ staff) | ₦400,000+ | Unlimited, Priority support, Custom integrations |

### Cost Drivers (Estimated for Professional Tier - 1,000 consultations/month)

| Service | Usage Estimate | Monthly Cost (USD) |
|---------|----------------|-------------------|
| **Cloud Run** | 50,000 requests, 2GB memory | $15-25 |
| **Cloud SQL (PostgreSQL)** | db-f1-micro, 10GB storage | $10-15 |
| **Gemini API** | 1,000 diagnosis requests | $5-10 |
| **Cloud Storage** | 5GB patient documents | $1-2 |
| **Pub/Sub** | 5,000 messages | $0.50 |
| **Secret Manager** | 10 secrets, 1,000 accesses | $0.10 |
| **Egress** | 10GB | $1-2 |
| **Total Estimated** | | **$35-55/month** |

### Optimization Strategy

1. **Auto-scaling Configuration**: Cloud Run scales to zero during off-hours (nights, weekends)
2. **Caching Layer**: Implement Redis for frequently accessed data (ICD-10 codes, drug library)
3. **Batch AI Requests**: Group non-urgent diagnostic suggestions for batch processing
4. **Regional Deployment**: Deploy to `europe-west1` (Belgium) for lower latency
5. **Reserved Instances**: Commit to Cloud SQL reserved capacity for 30% savings

---

## 3.2 Security, Compliance, and IAM

### API Security

```typescript
// Credential Protection
- JWT secrets stored in environment variables
- API keys accessed via Secret Manager in production
- No credentials exposed to client-side code
- Tokens expire: Access (7 days), Refresh (30 days)

// Request Security
- Helmet.js for security headers
- CORS restricted to allowed origins
- Rate limiting: 100 requests per 15 minutes per IP
- Input validation on all endpoints
```

### Data Handling & Privacy

| Aspect | Implementation |
|--------|----------------|
| **Encryption in Transit** | HTTPS/TLS enforced on all endpoints |
| **Encryption at Rest** | Cloud SQL encryption enabled |
| **Password Storage** | bcrypt with salt rounds (10) |
| **PHI Protection** | Patient data never logged; IDs used for debugging |
| **Data Retention** | Configurable per clinic; OTPs expire in 10 minutes |
| **HIPAA Alignment** | Audit logging prepared; access controls implemented |

### Authentication & Authorization (IAM)

**Registration Flow**:
```
1. Admin: Fill in personal details → Verify Email Address → Onboard Clinic → Login → Invite Staffs → Configure Clinic Settings 
2. Staff: Receive Email Invitation → Login with Temp Password → Change Password → Login → JWT Token
```

**User Authentication Flow**:
```
1. Admin: Email/Password → JWT Token
2. Staff: Email/Password → JWT Token
3. Patients: Email → OTP → JWT Token (Passwordless)
```

**Role-Based Access Control (RBAC)**:
```typescript
// Middleware chain
authenticate → authorize([roles]) → tenantIsolation → controller

// Example: Only DOCTORs can create consultations
router.post('/consultations', 
  authenticate,
  authorize(['DOCTOR']),
  tenantIsolation,
  createConsultation
);
```

**Multi-Tenancy Isolation**:
```typescript
// Every request scoped to user's clinic
req.clinicId = user.clinicId;
// All queries include: WHERE clinicId = req.clinicId
```

**Google Cloud IAM (Production)**:
- Service Account with least-privilege permissions
- Separate accounts for: Cloud Run, Pub/Sub Publisher, Secret Accessor
- Workload Identity Federation for secure credential management

---

## Appendix: Quick Start Guide

### Local Development Setup

```bash
# Clone and install
git clone <repository>
cd backend
pnpm install

# Environment setup
cp .env.example .env.local
# Edit .env.local with your credentials

# Database setup
docker-compose up -d postgres
pnpm prisma migrate dev --schema=src/prisma/schema.prisma
pnpm prisma generate --schema=src/prisma/schema.prisma

# Start development server
pnpm run dev
```

### Environment Variables Required

```env
NODE_ENV=development
PORT=8080
DATABASE_URL=postgresql://user:pass@localhost:5432/wecareehr
JWT_SECRET=<generated-secret>
JWT_REFRESH_SECRET=<generated-secret>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASSWORD=<app-password>
AI_API_KEY=<gemini-api-key>
GCP_PROJECT_ID=team-ehr
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
ENCRYPTION_KEY= in your cli run openssl rand -hex 32
LOG_LEVEL=debug
```

---

**Document Version**: 1.0  
**Last Updated**: November 2025 
**Team**: 
- Adeola Abdulramon - Backend Developer(Team Lead)
- Fadamintan Daniel - Frontend Developer

- Testimony Everest - Frontend Developer


