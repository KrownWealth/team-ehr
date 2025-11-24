import React from "react";
import {
  ChevronRight,
  FolderIcon,
  ListIcon,
  UserPlusIcon,
  Activity,
  Stethoscope,
  CreditCard,
} from "lucide-react";

function About() {
  return (
    <div className="section-2 p-6 scroll-mt-20" id="About">
      <div className="space-y-14">
        <div className="header text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Still managing patient <br /> records on paper?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Digitize your entire clinical workflow from registration to billing.
          </p>
        </div>

        <div className="main grid md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10 max-w-screen-2xl mx-auto">
          {/* 1. Registration */}
          <div className="sheet rounded-4xl bg-gray-100 p-10 md:p-12">
            <button className="bg-white w-fit rounded-full font-semibold flex items-center gap-2 border-none px-4 py-2 text-black text-lg shadow-sm">
              <UserPlusIcon className="text-primary w-5 h-5" strokeWidth={2} />
              Register
            </button>
            <br />
            <div className="space-y-3 max-w-xs">
              <h3 className="text-3xl mb:text-4xl font-semibold">
                Instantly Register Patients In Seconds
              </h3>
            </div>
            <br />
            <div className="image text-lg max-w-xl leading-relaxed">
              <p>
                Quickly add new patients with NIN validation to prevent
                duplicates. Capture essential demographics and generate a unique
                Patient ID instantly, so staff can focus on care, not paperwork.
              </p>
            </div>
          </div>

          {/* 2. Queue Management */}
          <div className="sheet rounded-4xl bg-gray-100 p-10 md:p-12">
            <button className="bg-white w-fit rounded-full font-semibold flex items-center gap-2 border-none px-4 py-2 text-black text-lg shadow-sm">
              <ListIcon className="text-primary w-5 h-5" strokeWidth={2} />
              Queue
            </button>
            <br />
            <div className="space-y-3 max-w-sm">
              <h3 className="text-3xl mb:text-4xl font-semibold">
                Smooth Transition From Lobby To Doctor
              </h3>
            </div>
            <br />
            <div className="image text-lg max-w-xl leading-relaxed">
              <p>
                Manage patient flow effortlessly with real-time queue boards.
                Route patients to vitals, labs, or consultations automatically,
                reducing waiting room chaos and keeping everyone informed.
              </p>
            </div>
          </div>

          {/* 3. Vitals Triage (New) */}
          <div className="sheet rounded-4xl bg-gray-100 p-10 md:p-12">
            <button className="bg-white w-fit rounded-full font-semibold flex items-center gap-2 border-none px-4 py-2 text-black text-lg shadow-sm">
              <Activity className="text-primary w-5 h-5" strokeWidth={2} />
              Vitals
            </button>
            <br />
            <div className="space-y-3 max-w-sm">
              <h3 className="text-3xl mb:text-4xl font-semibold">
                Spot Warning Signs Automatically
              </h3>
            </div>
            <br />
            <div className="image text-lg max-w-xl leading-relaxed">
              <p>
                Nurses can record BP, temperature, and pulse in seconds. The
                system auto-calculates BMI and flags abnormal readings
                (critical/warning) immediately to help prioritize urgent cases.
              </p>
            </div>
          </div>

          {/* 4. Doctor Consultation (New) */}
          <div className="sheet rounded-4xl bg-gray-100 p-10 md:p-12">
            <button className="bg-white w-fit rounded-full font-semibold flex items-center gap-2 border-none px-4 py-2 text-black text-lg shadow-sm">
              <Stethoscope className="text-primary w-5 h-5" strokeWidth={2} />
              Consultation
            </button>
            <br />
            <div className="space-y-3 max-w-sm">
              <h3 className="text-3xl mb:text-4xl font-semibold">
                AI-Powered Diagnosis Support
              </h3>
            </div>
            <br />
            <div className="image text-lg max-w-xl leading-relaxed">
              <p>
                Empower doctors with AI that suggests differential diagnoses and
                checks for drug allergies in real-time. Use structured SOAP
                notes to maintain high standards of clinical documentation.
              </p>
            </div>
          </div>

          {/* 5. Patient Records */}
          <div className="sheet rounded-4xl bg-gray-100 p-10 md:p-12">
            <button className="bg-white w-fit rounded-full font-semibold flex items-center gap-2 border-none px-4 py-2 text-black text-lg shadow-sm">
              <FolderIcon className="text-primary w-5 h-5" strokeWidth={2} />
              Records
            </button>
            <br />
            <div className="space-y-3 max-w-sm">
              <h3 className="text-3xl mb:text-4xl font-semibold">
                Access Complete History Instantly
              </h3>
            </div>
            <br />
            <div className="image text-lg max-w-xl leading-relaxed">
              <p>
                View and update patient medical records in one secure place.
                Track past visits, lab results, and medication history to ensure
                continuity of care across different visits.
              </p>
            </div>
          </div>

          {/* 6. Billing & Revenue (New) */}
          <div className="sheet rounded-4xl bg-gray-100 p-10 md:p-12">
            <button className="bg-white w-fit rounded-full font-semibold flex items-center gap-2 border-none px-4 py-2 text-black text-lg shadow-sm">
              <CreditCard className="text-primary w-5 h-5" strokeWidth={2} />
              Billing
            </button>
            <br />
            <div className="space-y-3 max-w-sm">
              <h3 className="text-3xl mb:text-4xl font-semibold">
                Stop Revenue Leakage Completely
              </h3>
            </div>
            <br />
            <div className="image text-lg max-w-xl leading-relaxed">
              <p>
                Automatically generate invoices for every service rendered.
                Track daily revenue, print professional receipts, and monitor
                outstanding balances to keep your clinic profitable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
