/**
 * Integration Test Script for wecareEHR Critical Workflows
 *
 * Tests the complete patient journey:
 * 1. Register patient (offline)
 * 2. Record vitals (offline)
 * 3. Create consultation (offline)
 * 4. Sync all actions to server
 * 5. Verify data integrity and tenancy isolation
 *
 * Run: npx ts-node backend/tests/integration-test.ts
 */

import axios, { AxiosInstance } from "axios";
import { v4 as uuidv4 } from "uuid";

const API_BASE_URL = process.env.API_URL || "http://localhost:8080/api/v1";

interface TestUser {
  email: string;
  password: string;
  token?: string;
  clinicId?: string;
  role: string;
}

interface TestResults {
  passed: number;
  failed: number;
  tests: Array<{ name: string; status: "PASS" | "FAIL"; error?: string }>;
}

class IntegrationTester {
  private api: AxiosInstance;
  private results: TestResults = { passed: 0, failed: 0, tests: [] };

  // Test users
  private clinicAAdmin: TestUser = {
    email: "admin.clinica@test.com",
    password: "Test123!",
    role: "ADMIN",
  };

  private clinicBAdmin: TestUser = {
    email: "admin.clinicb@test.com",
    password: "Test123!",
    role: "ADMIN",
  };

  private clinicADoctor: TestUser = {
    email: "doctor.clinica@test.com",
    password: "Test123!",
    role: "DOCTOR",
  };

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });
  }

  private log(message: string, level: "INFO" | "SUCCESS" | "ERROR" = "INFO") {
    const colors = {
      INFO: "\x1b[36m",
      SUCCESS: "\x1b[32m",
      ERROR: "\x1b[31m",
    };
    console.log(`${colors[level]}[${level}]\x1b[0m ${message}`);
  }

  private recordTest(name: string, passed: boolean, error?: string) {
    if (passed) {
      this.results.passed++;
      this.results.tests.push({ name, status: "PASS" });
      this.log(`✓ ${name}`, "SUCCESS");
    } else {
      this.results.failed++;
      this.results.tests.push({ name, status: "FAIL", error });
      this.log(`✗ ${name}: ${error}`, "ERROR");
    }
  }

  /**
   * Test 1: User Registration and Authentication
   */
  async testAuthentication() {
    this.log("\n=== Testing Authentication ===", "INFO");

    try {
      // Register Clinic A Admin
      const registerResponse = await this.api.post("/auth/register", {
        firstName: "Admin",
        lastName: "ClinicA",
        email: this.clinicAAdmin.email,
        phone: "+2348012345678",
        password: this.clinicAAdmin.password,
      });

      this.recordTest("User Registration", registerResponse.status === 201);

      // Login
      const loginResponse = await this.api.post("/auth/login", {
        email: this.clinicAAdmin.email,
        password: this.clinicAAdmin.password,
      });

      this.clinicAAdmin.token = loginResponse.data.data.token;
      this.clinicAAdmin.clinicId = loginResponse.data.data.user.clinicId;

      this.recordTest(
        "User Login",
        loginResponse.status === 200 && !!this.clinicAAdmin.token
      );
    } catch (error: any) {
      this.recordTest("Authentication Flow", false, error.message);
    }
  }

  /**
   * Test 2: Clinic Onboarding
   */
  async testClinicOnboarding() {
    this.log("\n=== Testing Clinic Onboarding ===", "INFO");

    try {
      const response = await this.api.post(
        "/admin/clinic/onboard",
        {
          name: "Test Clinic A",
          type: "PRIMARY_HEALTH_CENTER",
          address: "123 Test Street",
          city: "Lagos",
          state: "Lagos",
          lga: "Ikeja",
          phone: "+2348012345678",
          email: "clinica@test.com",
          numberOfDoctors: 5,
          averageDailyPatients: 50,
        },
        {
          headers: { Authorization: `Bearer ${this.clinicAAdmin.token}` },
        }
      );

      this.clinicAAdmin.clinicId = response.data.data.id;
      this.recordTest("Clinic Onboarding", response.status === 201);
    } catch (error: any) {
      this.recordTest("Clinic Onboarding", false, error.message);
    }
  }

  /**
   * Test 3: Offline Sync - Patient Registration
   */
  async testOfflinePatientRegistration() {
    this.log("\n=== Testing Offline Patient Registration ===", "INFO");

    try {
      const clientId = uuidv4();
      const syncAction = {
        clientId,
        type: "CREATE_PATIENT",
        timestamp: new Date().toISOString(),
        data: {
          firstName: "John",
          lastName: "Doe",
          gender: "MALE",
          birthDate: "1990-01-01",
          phone: "+2348087654321",
          email: "john.doe@test.com",
          addressLine: "456 Patient Street",
          city: "Lagos",
          state: "Lagos",
          emergencyContact: "Jane Doe",
          emergencyPhone: "+2348012345679",
          emergencyRelation: "Spouse",
        },
      };

      const response = await this.api.post(
        "/sync",
        {
          lastSyncTimestamp: null,
          pendingActions: [syncAction],
        },
        {
          headers: {
            Authorization: `Bearer ${this.clinicAAdmin.token}`,
            "X-Request-ID": clientId,
          },
        }
      );

      const success =
        response.status === 200 &&
        response.data.data.processedActions[0].success;

      this.recordTest("Offline Patient Sync", success);

      // Store patient ID for later tests
      if (success) {
        (this as any).testPatientId =
          response.data.data.processedActions[0].serverId;
      }
    } catch (error: any) {
      this.recordTest("Offline Patient Sync", false, error.message);
    }
  }

  /**
   * Test 4: Offline Sync - Vitals Recording
   */
  async testOfflineVitalsRecording() {
    this.log("\n=== Testing Offline Vitals Recording ===", "INFO");

    try {
      const clientId = uuidv4();
      const syncAction = {
        clientId,
        type: "RECORD_VITALS",
        timestamp: new Date().toISOString(),
        data: {
          patientId: (this as any).testPatientId,
          bloodPressure: "180/120", // Critical - should trigger alert
          temperature: 38.5,
          pulse: 95,
          respiration: 18,
          weight: 75,
          height: 1.75,
          spo2: 97,
        },
      };

      const response = await this.api.post(
        "/sync",
        {
          lastSyncTimestamp: null,
          pendingActions: [syncAction],
        },
        {
          headers: {
            Authorization: `Bearer ${this.clinicAAdmin.token}`,
            "X-Request-ID": clientId,
          },
        }
      );

      const success =
        response.status === 200 &&
        response.data.data.processedActions[0].success;

      this.recordTest("Offline Vitals Sync", success);
    } catch (error: any) {
      this.recordTest("Offline Vitals Sync", false, error.message);
    }
  }

  /**
   * Test 5: Multi-Tenancy Isolation
   */
  async testTenancyIsolation() {
    this.log("\n=== Testing Multi-Tenancy Isolation ===", "INFO");

    try {
      // Try to access Clinic A's patient from Clinic B's token
      // First, register and login Clinic B admin
      await this.api.post("/auth/register", {
        firstName: "Admin",
        lastName: "ClinicB",
        email: this.clinicBAdmin.email,
        phone: "+2348012345680",
        password: this.clinicBAdmin.password,
      });

      const loginResponse = await this.api.post("/auth/login", {
        email: this.clinicBAdmin.email,
        password: this.clinicBAdmin.password,
      });

      this.clinicBAdmin.token = loginResponse.data.data.token;

      // Onboard Clinic B
      await this.api.post(
        "/admin/clinic/onboard",
        {
          name: "Test Clinic B",
          type: "GENERAL_HOSPITAL",
          address: "789 Test Avenue",
          city: "Abuja",
          state: "FCT",
          lga: "Municipal",
          phone: "+2348012345680",
          email: "clinicb@test.com",
        },
        {
          headers: { Authorization: `Bearer ${this.clinicBAdmin.token}` },
        }
      );

      // Try to access Clinic A's patient with Clinic B's token
      try {
        await this.api.get(`/patients/${(this as any).testPatientId}`, {
          headers: { Authorization: `Bearer ${this.clinicBAdmin.token}` },
        });

        // If we get here, tenancy is BROKEN
        this.recordTest(
          "Tenancy Isolation",
          false,
          "Cross-tenant access allowed!"
        );
      } catch (error: any) {
        // Should get 404 or 403
        const isolated =
          error.response?.status === 404 || error.response?.status === 403;
        this.recordTest("Tenancy Isolation", isolated);
      }
    } catch (error: any) {
      this.recordTest("Tenancy Isolation Setup", false, error.message);
    }
  }

  /**
   * Test 6: Idempotency
   */
  async testIdempotency() {
    this.log("\n=== Testing Idempotency ===", "INFO");

    try {
      const requestId = uuidv4();
      const appointmentData = {
        patientId: (this as any).testPatientId,
        appointmentDate: new Date(Date.now() + 86400000).toISOString(),
        reason: "Follow-up consultation",
      };

      // First request
      const response1 = await this.api.post("/appointments", appointmentData, {
        headers: {
          Authorization: `Bearer ${this.clinicAAdmin.token}`,
          "X-Request-ID": requestId,
        },
      });

      const appointmentId = response1.data.data.id;

      // Second request with same ID (should return cached response)
      const response2 = await this.api.post("/appointments", appointmentData, {
        headers: {
          Authorization: `Bearer ${this.clinicAAdmin.token}`,
          "X-Request-ID": requestId,
        },
      });

      const idempotent =
        response1.status === 201 &&
        response2.status === 201 &&
        response1.data.data.id === response2.data.data.id;

      this.recordTest("Request Idempotency", idempotent);
    } catch (error: any) {
      this.recordTest("Request Idempotency", false, error.message);
    }
  }

  /**
   * Test 7: Complete Clinical Workflow
   */
  async testCompleteWorkflow() {
    this.log("\n=== Testing Complete Clinical Workflow ===", "INFO");

    try {
      // 1. Create appointment
      const appointmentRes = await this.api.post(
        "/appointments",
        {
          patientId: (this as any).testPatientId,
          appointmentDate: new Date().toISOString(),
          reason: "General checkup",
        },
        {
          headers: {
            Authorization: `Bearer ${this.clinicAAdmin.token}`,
            "X-Request-ID": uuidv4(),
          },
        }
      );

      // 2. Check in appointment
      await this.api.post(
        `/appointments/${appointmentRes.data.data.id}/check-in`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.clinicAAdmin.token}`,
            "X-Request-ID": uuidv4(),
          },
        }
      );

      // 3. Start consultation
      await this.api.post(
        `/appointments/${appointmentRes.data.data.id}/start-consultation`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.clinicAAdmin.token}`,
          },
        }
      );

      // 4. Create consultation
      const consultationRes = await this.api.post(
        "/consultations",
        {
          patientId: (this as any).testPatientId,
          subjective: "Patient complains of fever and headache",
          objective: "Temperature: 38.5°C, BP: 120/80",
          assessment: "Likely viral infection",
          plan: "Rest, hydration, paracetamol",
          prescriptions: [
            {
              drug: "Paracetamol",
              dosage: "500mg",
              frequency: "3 times daily",
              duration: "5 days",
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.clinicAAdmin.token}`,
            "X-Request-ID": uuidv4(),
          },
        }
      );

      // 5. Create bill
      const billRes = await this.api.post(
        "/billing/bills",
        {
          patientId: (this as any).testPatientId,
          items: [
            { description: "Consultation fee", amount: 5000 },
            { description: "Medication", amount: 2000 },
          ],
          totalAmount: 7000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.clinicAAdmin.token}`,
            "X-Request-ID": uuidv4(),
          },
        }
      );

      // 6. Record payment
      await this.api.post(
        "/billing/payments",
        {
          billId: billRes.data.data.id,
          amount: 7000,
          paymentMethod: "CASH",
        },
        {
          headers: {
            Authorization: `Bearer ${this.clinicAAdmin.token}`,
            "X-Request-ID": uuidv4(),
          },
        }
      );

      this.recordTest("Complete Clinical Workflow", true);
    } catch (error: any) {
      this.recordTest("Complete Clinical Workflow", false, error.message);
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    this.log("Starting wecareEHR Integration Tests...\n", "INFO");

    await this.testAuthentication();
    await this.testClinicOnboarding();
    await this.testOfflinePatientRegistration();
    await this.testOfflineVitalsRecording();
    await this.testTenancyIsolation();
    await this.testIdempotency();
    await this.testCompleteWorkflow();

    this.printResults();
  }

  /**
   * Print test results
   */
  private printResults() {
    console.log("\n" + "=".repeat(60));
    console.log("TEST RESULTS");
    console.log("=".repeat(60));

    this.results.tests.forEach((test) => {
      const icon = test.status === "PASS" ? "✓" : "✗";
      const color = test.status === "PASS" ? "\x1b[32m" : "\x1b[31m";
      console.log(`${color}${icon} ${test.name}\x1b[0m`);
      if (test.error) {
        console.log(`  Error: ${test.error}`);
      }
    });

    console.log("\n" + "=".repeat(60));
    console.log(
      `Total: ${this.results.passed + this.results.failed} | ` +
        `\x1b[32mPassed: ${this.results.passed}\x1b[0m | ` +
        `\x1b[31mFailed: ${this.results.failed}\x1b[0m`
    );
    console.log("=".repeat(60) + "\n");

    process.exit(this.results.failed > 0 ? 1 : 0);
  }
}

// Run tests
const tester = new IntegrationTester();
tester.runAllTests().catch((error) => {
  console.error("Test runner failed:", error);
  process.exit(1);
});
