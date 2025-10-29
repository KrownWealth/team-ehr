# 🏥 Architectural Principles to Code By: wecareEHR

These principles are the **non-negotiable guidelines** for all development, ensuring our technology aligns with the core values of **Accessibility, Simplicity, and Trust**. They are adapted to our specific technology stack and resource constraints (GCP $300 credits).

---

## Core Principles

### 1. Clean, Simple, Maintainable Code
* **Favor readability over cleverness.** Use clear, idiomatic **TypeScript and JavaScript**.
* **Prioritize simplicity in design.** Choose the simplest implementation that meets the requirements, especially for performance on **low-spec devices**.
* Write code that future developers can easily understand. Utilize clear naming conventions and structured commits.
* Follow **established patterns** within the codebase (e.g., repository pattern for data access, consistent error handling).

### 2. Mobile-First & Offline-First Compliance
* **Design for resilience:** Assume the network will fail. Core workflows (**Vitals, Consultation**) **must function offline**.
* **Prioritize client performance:** Minimize bundle size and API payload size for low-bandwidth, **low-resource mobile environments**.
* Use **functional components with hooks** in the frontend, optimized for rendering speed.
* Maintain **unidirectional data flow** (Client Action $\rightarrow$ Backend API $\rightarrow$ State Update).

### 3. Strict Security & Tenancy Compliance (Non-Negotiable)
* Enforce **Multi-Tenancy** on every backend request. The **clinicId must scope all database queries**.
* Enforce **Role-Based Access Control (RBAC)** at the API endpoint. A user's role must determine allowed actions, checked by backend middleware.
* **Never trust the client.** All input validation, business logic, and security checks **must reside on the backend**.
* Treat **PHI (Patient Health Information)** as highly sensitive. **Encrypt all patient data** at rest (Cloud SQL) and in transit (SSL/TLS).

### 4. No Hacky Fixes
* Avoid workarounds that **bypass the architecture** (e.g., hardcoding clinic-specific logic or bypassing the RBAC middleware).
* Don't use direct **DOM manipulation in React** where state should be used.
* Never use global state outside the established state management system for critical data.
* Avoid large, **non-idempotent transactions**. Prepare for network failures by ensuring API endpoints can be safely retried.

### 5. Thoughtful Change Management
* Consider the **full impact** of every change, particularly on **security, cost (GCP), and offline functionality**.
* Document assumptions behind your implementation, especially concerning synchronization or third-party APIs (NIN validation, payment gateways).
* Write comprehensive **unit and integration tests** that validate security (RBAC/Tenancy) and core workflow logic.
* Consider refactoring if it removes **technical debt**, improves security, or significantly **reduces GCP costs**.

---

## 🏛️ System Architecture Overview

The `wecareEHR` system follows a **strict separation of concerns** to maximize security, resilience, and cost efficiency.

### Backend API (Source of Truth)
**Technology Stack:** TypeScript, Node.js, Express.js, Google Cloud Platform (GCP - $300 credits)

| Component | GCP Service | Purpose & Constraint |
| :--- | :--- | :--- |
| **App Server** | **Cloud Run** | Handles all API requests. **Scales to zero to minimize cost**; we pay only for usage. Enforces RBAC and Tenancy middleware. |
| **Database** | **Cloud SQL (PostgreSQL)** | Authoritative, secure, relational data store. **Smallest instance type to manage budget.** Required for data integrity. |
| **Auth/Identity** | **Firebase Authentication** | Handles user identity and JWT issuance. **Uses the free tier** to manage all user roles. |
| **Async Tasks/AI** | **Cloud Functions & Pub/Sub** | Runs non-blocking tasks (e.g., email notifications, reporting, AI analysis). **Event-driven to avoid API latency.** |
| **Storage** | **Cloud Storage** | Stores binary files (photos, exports). Highly **cost-effective and scalable** file storage. |

**Responsibilities:**
* Maintains the complete and authoritative application state.
* Enforces all **business logic, tenancy, and security rules**.
* Processes actions via validated API endpoints.
* Handles asynchronous processing and AI integration.
* **Has no knowledge of the UI rendering** or client-side navigation.

### Client Application (Offline-First Interface)
**Technology Stack:** React/React Native (or equivalent mobile framework)

**Responsibilities:**
* Renders the current state provided by the API or local data.
* Manages **local state for offline usage** (IndexedDB, etc.).
* **Queues offline actions** for synchronization when connectivity is restored.
* Dispatches user actions (API requests) to the Backend API.
* Maintains minimal UI-specific state (e.g., form validation errors, menu toggles).

---

## 🔄 Communication Pattern

The system uses an **Action-Response pattern** for all client-backend communication, with asynchronous processing decoupled via Pub/Sub.

| Flow | Direction | Protocol/Mechanism | Description |
| :--- | :--- | :--- | :--- |
| **User Action** | Client $\rightarrow$ Backend | HTTPS/API Request (POST/PUT) | Dispatches a typed action (e.g., `POST /vitals`) to modify state. |
| **State Update** | Backend $\rightarrow$ Client | HTTPS/API Response (JSON) | Returns the updated state or a success confirmation. |
| **Asynchronous Event** | Backend $\rightarrow$ Pub/Sub $\rightarrow$ Function | Event-based messaging | **Non-blocking triggers** for AI processing or external communication (emails, alerts). |

---

## 🛠️ Implementation Guidelines

### AI/Intelligence Decoupling
* **Decouple AI from core workflow.** AI features (Diagnosis Suggestions, Drug Checker) **must run asynchronously** and must not block the core consultation or prescription workflow.
* AI analysis is an output of the system, **not a required input** for saving data.
* Use **Pub/Sub and Cloud Functions** for all AI/CDSS logic to manage costs and avoid scaling the core Cloud Run service unnecessarily.

### When to Consider Refactoring
* When new requirements attempt to **bypass tenancy or RBAC checks**.
* When a feature requires two different clients to implement the **same business logic**.
* When the **offline synchronization logic** becomes inconsistent or causes data conflicts.
* When a component needs a **hacky fix** to access or modify data that should be protected by the API.

### Decision Framework for Changes
When implementing features or fixes, ask yourself:
1.  Does this change respect the **separation of concerns**? (Is this logic on the correct side of the API?)
2.  Is **tenancy enforced**? Can another clinic's data be accidentally or maliciously accessed?
3.  How will this function reliably in an **offline state**? What is the conflict resolution plan?
4.  Is the **cost optimized**? Are we using Cloud Run and Cloud Functions efficiently, or am I introducing expensive idle resources?
5.  Am I **duplicating state** or introducing inconsistency (e.g., logic running only client-side)?