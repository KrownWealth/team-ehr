# wecareEHR System Documentation

## Overview

wecareEHR is a cloud-based, mobile-first Electronic Health Record (EHR) system designed specifically for low-resource healthcare settings in Nigeria and across Africa. The platform addresses the critical gap in healthcare digitization where most facilities still rely on paper-based patient records, leading to lost records, medical errors, and fragmented care.

### The Problem

- **95%** of Nigerian clinics use paper-based patient records
- **30-40%** of patient files are lost or misfiled annually
- Medical errors due to illegible handwriting and incomplete patient history
- No continuity of care when patients visit different facilities
- Zero data for public health surveillance and epidemic response
- Limited healthcare workforce unable to leverage technology for efficiency

### Our Solution

A simple, affordable, intelligent EHR system that:

- Digitizes patient records from registration through treatment
- Provides real-time access to complete patient medical history
- Uses AI to reduce medical errors and improve clinical decision-making
- Enables connected care across multiple facilities
- Works offline in low-connectivity environments
- Costs **80% less** than existing Western EHR solutions

## Table of Contents

- [Core Values](#core-values)
- [Features](#features)
- [User Roles & Permissions](#user-roles--permissions)
- [Technical Architecture](#technical-architecture)
- [Core Concepts](#core-concepts)
- [System Architecture](#system-architecture)
- [Workflow Processes](#workflow-processes)
- [Security & Implementation Guidelines](#security--implementation-guidelines)

---

## Core Values

1. **Accessibility** – Healthcare technology for every clinic, regardless of size or location
2. **Simplicity** – Intuitive, mobile-first design for low-resource environments
3. **Innovation** – AI-powered features that improve clinical outcomes
4. **Trust & Security** – Highest standards of patient data privacy and compliance
5. **Collaboration** – Unified platform connecting patients, providers, pharmacies, labs, insurers
6. **Impact-Driven** – Measurable reduction in medical errors and improvement in health outcomes

---

## Features

### Core Functionality

- **Multi-Tenant Architecture**: Complete data isolation between clinics
- **Role-Based Access Control**: Admin, Doctor, Nurse, Clerk, Cashier, Patient roles
- **Patient Management**: Registration with NIN validation, comprehensive medical history
- **Queue Management**: Real-time patient queue with status tracking
- **Vitals Recording**: Automated BMI calculation, abnormal value flagging
- **Doctor Consultations**: SOAP notes (Subjective, Objective, Assessment, Plan)
- **Patient Portal**: Access to health information, reminders, and tools to monitor vital signs, empowering patients to manage their own health proactively
- **Prescription Management**: Drug allergy checking, common drug library
- **Lab Management**: Test ordering, result entry, reference ranges
- **Billing & Payments**: Multiple payment methods, receipt generation
- **Reporting & Analytics**: Revenue tracking, patient statistics, charts

### AI-Powered Features

- **Diagnosis Suggestions**: AI recommends probable diagnoses based on symptoms
- **Drug Allergy Checker**: Alerts when prescribed drugs conflict with patient allergies
- **Vital Signs Monitoring**: Flags abnormal readings (critical, warning, normal)
- **Clinical Decision Support**: Real-time alerts for critical vital signs

---

## User Roles & Permissions

### Admin
- Full system access
- Staff management (add, edit, deactivate)
- Clinic configuration
- Financial reports
- Data export

### Doctor
- View assigned patients
- Write consultations (SOAP notes)
- Prescribe medications
- Order lab tests
- View patient history

### Nurse
- Record patient vitals
- View patient queue
- Update nursing notes
- View doctor orders

### Clerk/Receptionist
- Register new patients
- Schedule appointments
- Check-in patients
- Print receipts
- Manage patient queue

### Cashier
- Process payments
- Generate receipts
- View billing reports
- Handle refunds

### Patient
- Access personal health information
- View medical history and prescriptions
- Receive appointment reminders
- Monitor vital signs
- Manage health proactively

---

## Technical Architecture

### Technical Objectives

The wecareEHR system is built to ensure:

- **Security & Tenancy**: Strict multi-tenancy and Role-Based Access Control (RBAC) on every request
- **Offline-First Compliance**: Core workflows (Vitals, Consultation) function without network connectivity
- **Data Synchronization**: Reliable queuing of offline actions and synchronization with backend
- **State Updates**: Backend as the authoritative source of truth
- **Asynchronous Processing**: Decoupled non-blocking tasks (AI analysis, reporting) from core workflows

---

## Core Concepts

### Fundamental Principles

- **Source of Truth**: The Backend API maintains the complete and authoritative application state. The client is never trusted.

- **Multi-Tenancy**: All data access must be scoped by `clinicId`. This is enforced on every backend request and database query.

- **RBAC (Role-Based Access Control)**: User permissions determine allowed actions based on assigned roles. Checked by backend middleware at each API endpoint.

- **PHI (Patient Health Information)**: Highly sensitive data encrypted at rest (Cloud SQL) and in transit (SSL/TLS).

- **Offline-First**: Core workflows must function without network connection.

- **Synchronization**: Client queues offline actions (in indexedDB) and dispatches them to the backend when connectivity is restored.

- **Action**: User-initiated request dispatched from client to backend (e.g., `POST /vitals`).

- **Asynchronous Event**: Non-blocking task (AI analysis, email notifications) triggered by backend but decoupled via Pub/Sub to avoid API latency.

- **Resolution**: Backend processes action, enforces business logic and security rules, and updates authoritative state.

---

## System Architecture

### Key Components

#### Backend API / App Server (Cloud Run)
- Central authority for application state and rules
- Receives actions via HTTPS API requests
- Validates all requests using RBAC and Tenancy middleware
- Processes valid actions and enforces business logic
- Emits JSON responses reflecting updated state
- Triggers asynchronous events via Pub/Sub
- Scales to zero to minimize costs

#### Database (Cloud SQL - PostgreSQL)
- Authoritative, secure, relational data store
- Stores all application data including encrypted PHI
- Accessed only by Backend API

#### Auth/Identity (Firebase Authentication)
- Handles user identity and JWT issuance
- Manages user roles for RBAC

#### Async Tasks/AI (Cloud Functions & Pub/Sub)
- Executes non-blocking, decoupled tasks
- Handles AI analysis, reporting, and email notifications
- Triggered by Backend API events to avoid API latency

#### Storage (Cloud Storage)
- Stores binary files (photos, exports)

#### Client Application (Next.JS)
- Captures user interactions triggering actions
- Renders current state based on API responses or local data
- Manages local state for offline usage (indexedDB)
- Queues offline actions for synchronization
- Dispatches API requests to Backend API

#### Local Store (indexedDB)
- Maintains local application state for Client Application
- Holds queued actions waiting for network connectivity

---

## Workflow Processes

### 1. Online Action Flow

**Example: Submitting Vitals**

1. **User Interaction**: User fills out Vitals form in Client Application

2. **Action Dispatch**: Client dispatches HTTPS request (`POST /vitals`) to Backend API with data payload and JWT

3. **Backend Validation (Auth)**: Backend validates JWT via Firebase Authentication middleware

4. **Backend Validation (RBAC)**: RBAC middleware checks user role permissions for this action

5. **Backend Validation (Tenancy)**: Tenancy middleware verifies request is scoped to user's `clinicId`

6. **Backend Processing**: Service layer processes validated action and enforces business logic

7. **State Update**: Service interacts with Cloud SQL, saving record in transaction scoped with `WHERE clinicId = ?`

8. **Event Propagation**: Backend returns JSON response confirming successful state update

9. **Client Store Update**: Client receives JSON response, updates local state, and re-renders UI

### 2. Offline-First Synchronization Flow

1. **Network Loss**: Client detects network failure and enters offline state

2. **User Interaction**: User performs action in core workflow (e.g., saves Consultation)

3. **Local Queuing**: Client saves action and payload to Local Store (indexedDB) instead of dispatching API request

4. **Optimistic UI Update**: Client immediately updates local state and UI as if save was successful

5. **Network Restoration**: Client detects connectivity is restored

6. **Sync Dispatch**: Sync service retrieves queued action from Local Store

7. **Action Dispatch**: Client dispatches queued API request to Backend API

8. **Backend Processing**: Backend processes request following standard Online Action Flow

9. **Resolve Queue**: Upon successful response, client removes action from Local Store queue (if failed, remains for retry)

### 3. Asynchronous Event Flow

**Example: AI Analysis**

1. **Trigger Event**: After successfully saving consultation to Cloud SQL, service layer determines async task is needed

2. **Event Dispatch**: Backend publishes event message (e.g., `{ consultationId: 123, clinicId: 'A' }`) to Pub/Sub topic

3. **Immediate Response**: Backend completes original request immediately, sending response to client without waiting for async task

4. **Function Trigger**: Pub/Sub routes message to subscribed Cloud Function

5. **Execute Task**: Cloud Function executes decoupled logic (e.g., AI Diagnosis Suggestions)

6. **State Update (Async)**: Cloud Function writes results back to Cloud SQL

7. **Task Completion**: Cloud Function completes and shuts down. Client notified on next refresh or via separate notification

### State Changes Example: Doctor Saves Vitals Online

```
1. Action: User clicks "Save" → Client dispatches POST /vitals with data + JWT
2. Engine: Cloud Run validates JWT via Firebase Auth
3. Engine: RBAC middleware confirms "Doctor" role can POST /vitals
4. Engine: Tenancy middleware validates clinicId
5. Engine: Service layer processes action and validates business logic
6. Engine: INSERT to Cloud SQL WHERE clinicId = 'A'
7. Engine: Dispatch { vitalsId: 456, type: 'NEW_VITALS' } to Pub/Sub
8. Engine: Returns 201 Created with new Vitals JSON
9. Stores: Client updates local state and UI shows "Saved"
10. Async: Cloud Function triggered by Pub/Sub runs AI analysis
11. Async: Cloud Function writes AI results to Cloud SQL
```

---

## Security & Implementation Guidelines

### Critical Security Rules

⚠️ **The system does not load logic definitions from files; all logic is enforced by the Backend API.**

#### Tenancy Enforcement
- All database queries **must** be scoped by `clinicId`
- Non-negotiable requirement enforced by backend middleware and services
- Example: `WHERE clinicId = ?` on all queries

#### RBAC Enforcement
- All API endpoints **must** be protected by middleware
- Validates user role (from Firebase Auth JWT) against required permission
- No action proceeds without role verification

#### No Client-Side Logic
- All business logic, input validation, and security checks **must** reside on backend
- Client is only responsible for:
  - Rendering state
  - Dispatching actions
  - Managing local offline queue

#### Decoupling
- AI and non-core logic **must** be decoupled via Pub/Sub and Cloud Functions
- Prevents blocking core workflows
- Manages costs through independent scaling

### Data Protection

- **At Rest**: PHI encrypted in Cloud SQL
- **In Transit**: All communications via SSL/TLS
- **Access Control**: Multi-layered (Auth → RBAC → Tenancy)
- **Zero Trust**: Client is never trusted; all validation occurs server-side

---

## Technology Stack

- **Frontend**: Next.JS
- **Backend**: Cloud Run (Node.js, Express.JS, Typescript)
- **Database**: Cloud SQL (PostgreSQL)
- **Authentication**: Firebase Authentication
- **Async Processing**: Cloud Functions + Pub/Sub
- **Storage**: Cloud Storage
- **Local Storage**: indexedDB

---

## Getting Started

[Add installation, configuration, and deployment instructions specific to your implementation]

## Contributing

[Add contribution guidelines if applicable]

## License

[Add license information]

## Support

[Add support contact information]