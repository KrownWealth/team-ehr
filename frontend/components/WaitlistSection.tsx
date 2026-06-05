"use client";

import { useState } from "react";

// ─── Types
type Role = "clinic_owner" | "clinician" | "admin" | "other";

interface FormState {
  name: string;
  email: string;
  facility: string;
  role: Role | "";
}

interface SubmitState {
  status: "idle" | "loading" | "success" | "error";
  message: string;
}

// ─── Constants
const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "clinic_owner", label: "Clinic Owner / Director" },
  { value: "clinician", label: "Clinician / Nurse" },
  { value: "admin", label: "Admin / Records Officer" },
  { value: "other", label: "Other" },
];

const SOCIAL_PROOF_STATS = [
  { value: "200+", label: "Facilities on waitlist" },
  { value: "2026", label: "Pilot launch" },
  { value: "Free", label: "Early access tier" },
];

// ─── Sub-components
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-2xl font-bold text-[#2d8f5e]">{value}</span>
      <span className="text-xs text-gray-500 text-center">{label}</span>
    </div>
  );
}

function SuccessCard({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center animate-fade-in">
      {/* Animated checkmark */}
      <div className="w-16 h-16 rounded-full bg-[#e6f7ef] flex items-center justify-center">
        <svg
          className="w-8 h-8 text-[#2d8f5e]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900">
          You're on the list, {name.split(" ")[0]}!
        </h3>
        <p className="mt-1 text-sm text-gray-500 max-w-xs">
          We'll reach out before the 2026 pilot with early access details. Share
          with a colleague — every facility matters.
        </p>
      </div>

      {/* Share nudge */}
      <button
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: "Join the Lifeven Health waitlist",
              text: "Nigeria's first offline-first EHR built for real clinics — join the waitlist.",
              url: window.location.href,
            });
          } else {
            navigator.clipboard.writeText(window.location.href);
          }
        }}
        className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#2d8f5e] px-5 py-2 text-sm font-medium text-[#2d8f5e] hover:bg-[#e6f7ef] transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        Share with a colleague
      </button>
    </div>
  );
}

export default function WaitlistSection() {
  // console.log("Waitlist rendered")

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    facility: "",
    role: "",
  });

  const [submit, setSubmit] = useState<SubmitState>({
    status: "idle",
    message: "",
  });

  const isValid =
    form.name.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.role !== "";

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!isValid) return;

    setSubmit({ status: "loading", message: "" });

    try {
      // TODO ── Replace with real API call / form service ──────────
      // e.g. Resend, Loops, Airtable, Supabase, nodemailer, etc.
      await new Promise((res) => setTimeout(res, 1200)); // simulated delay
      // ───────

      setSubmit({ status: "success", message: "" });
    } catch {
      setSubmit({
        status: "error",
        message: "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <section
      id="waitlist"
      className="relative w-full overflow-hidden bg-[#f0faf4] py-20 px-4"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#c6edd8] opacity-40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#a8dfc0] opacity-30 blur-3xl"
      />

      <div className="relative mx-auto max-w-lg">
        <div className="mb-4 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d4f0e2] px-3 py-1 text-xs font-semibold text-[#1a6b42] ring-1 ring-[#a8dfc0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2d8f5e] animate-pulse" />
            Piloting 2026 · Limited spots
          </span>
        </div>

        <h2 className="text-center text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl">
          Be first when we launch
        </h2>
        <p className="mt-3 text-center text-sm sm:text-base text-gray-500 leading-relaxed">
          Join clinics across Nigeria getting early access to Lifeven Health —
          the offline-first EHR built for how your facility actually works.
        </p>

        <div className="mt-6 flex justify-center gap-8 border-y border-[#c6edd8] py-4">
          {SOCIAL_PROOF_STATS.map((s) => (
            <StatPill key={s.label} {...s} />
          ))}
        </div>

        {/* Card */}
        <div className="mt-8 rounded-2xl bg-white shadow-md shadow-[#a8dfc0]/30 ring-1 ring-[#d4f0e2] p-6 sm:p-8">
          {submit.status === "success" ? (
            <SuccessCard name={form.name} />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="wl-name"
                  className="text-xs font-semibold text-gray-600 uppercase tracking-wide"
                >
                  Full name
                </label>
                <input
                  id="wl-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Dr. Amaka Obi"
                  value={form.name}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2d8f5e] focus:outline-none focus:ring-2 focus:ring-[#2d8f5e]/20 transition"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="wl-email"
                  className="text-xs font-semibold text-gray-600 uppercase tracking-wide"
                >
                  Work email
                </label>
                <input
                  id="wl-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="amaka@greencross-clinic.ng"
                  value={form.email}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2d8f5e] focus:outline-none focus:ring-2 focus:ring-[#2d8f5e]/20 transition"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="wl-facility"
                  className="text-xs font-semibold text-gray-600 uppercase tracking-wide"
                >
                  Facility name{" "}
                  <span className="font-normal text-gray-400 normal-case">
                    (optional)
                  </span>
                </label>
                <input
                  id="wl-facility"
                  name="facility"
                  type="text"
                  placeholder="Green Cross Clinic, Lagos"
                  value={form.facility}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2d8f5e] focus:outline-none focus:ring-2 focus:ring-[#2d8f5e]/20 transition"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="wl-role"
                  className="text-xs font-semibold text-gray-600 uppercase tracking-wide"
                >
                  Your role
                </label>
                <select
                  id="wl-role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:border-[#2d8f5e] focus:outline-none focus:ring-2 focus:ring-[#2d8f5e]/20 transition appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    Select your role…
                  </option>
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error message */}
              {submit.status === "error" && (
                <p className="text-xs text-red-500 -mt-1">{submit.message}</p>
              )}

              {/* CTA */}
              <button
                onClick={handleSubmit}
                disabled={!isValid || submit.status === "loading"}
                className="mt-2 w-full rounded-xl bg-[#1e7a46] py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#185f38] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#2d8f5e]/40"
              >
                {submit.status === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                      />
                    </svg>
                    Joining…
                  </span>
                ) : (
                  "Join the Waitlist →"
                )}
              </button>

              <p className="text-center text-[11px] text-gray-400">
                No spam. We'll only contact you about early access.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
