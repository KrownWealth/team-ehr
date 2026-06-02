"use client";

import * as React from "react";
import { Button, Link } from "@heroui/react";
import {
  MoveRight,
  CheckCircle,
  Shield,
  Clock,
  WifiOff,
  Fingerprint,
  Share2,
  ScanLine,
  BarChart3,
  Trophy,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Activity,
  Building2,
} from "lucide-react";

import Footer from "@/components/reusables/footer/Footer";
import AppNavbar from "@/components/reusables/customUI/header";
import { useBrand } from "@/lib/hooks/use-brand";

export default function LandingPage() {
  const brand = useBrand();

  // Cited problem-scale figures (sources documented in our grant application).
  const stats = [
    { number: "85.3%", label: "of Nigerian health facilities still rely on paper records" },
    { number: "30-40%", label: "of patient files lost or misfiled every year" },
    { number: "70%", label: "of Nigerians depend on PHCs & private clinics for care" },
    { number: "95M+", label: "Nigerians living with a communicable & non-communicable disease burden" },
  ];

  // The three core operational components of the platform.
  const pillars = [
    {
      icon: WifiOff,
      title: "Offline-First Point-of-Care",
      description:
        "Clinicians capture patient information on a mobile-first app. Records are stored securely on-device and sync to the cloud once connectivity returns, so unstable internet and power never interrupt care.",
    },
    {
      icon: Fingerprint,
      title: "Unified Patient Identity",
      description:
        "Linking the National Identity Number (NIN) gives every patient one portable digital record across facilities, cutting duplicate entries, repeated tests, and the loss of paper files.",
    },
    {
      icon: BarChart3,
      title: "Real-Time Health Intelligence",
      description:
        "Fragmented clinical notes become structured, actionable data that helps facilities track disease patterns, treatment outcomes, and strengthen public-health surveillance in real time.",
    },
  ];

  // Honest, shippable capabilities. No overclaiming.
  const features = [
    {
      icon: WifiOff,
      title: "Works Offline",
      description:
        "Offline-first design for facilities with intermittent internet and power. Capture now, sync automatically later.",
    },
    {
      icon: Fingerprint,
      title: "NIN-Linked Records",
      description:
        "A single, verifiable patient identity that follows the patient between clinics and diagnostic centers.",
    },
    {
      icon: Share2,
      title: "Standards-Based Interoperability",
      description:
        "Built on global openEHR canonical modeling and HL7 FHIR for secure, portable longitudinal records.",
    },
    {
      icon: ScanLine,
      title: "Digitize Legacy Paper",
      description:
        "OCR-assisted onboarding evaluates existing paper files so facilities transition without losing history.",
    },
    {
      icon: Clock,
      title: "Queue & Clinic Operations",
      description:
        "Queue-based monitoring streamlines patient flow and reduces time spent waiting at the point of care.",
    },
    {
      icon: Shield,
      title: "Privacy & Compliance",
      description:
        "Designed around the Nigeria Data Protection Act (2023), with encryption in transit and at rest.",
    },
  ];

  // Real validation. The proof a funder actually trusts.
  const recognition = [
    {
      icon: Trophy,
      title: "1st Place at Build with Google Hackathon",
      description:
        "Our MVP won 1st place at the 2025 Codematic Build with Google Hackathon, validating the technical framework.",
    },
    {
      icon: GraduationCap,
      title: "Africa Health-Tech Accelerator",
      description:
        "Currently enrolled, with the mentorship and institutional support to move from prototype to market-ready.",
    },
    {
      icon: Sparkles,
      title: "Working MVP",
      description:
        "A cloud-based MVP has undergone technical validation, confirming our interoperable, standards-aligned architecture.",
    },
    {
      icon: ShieldCheck,
      title: "Policy-Aligned",
      description:
        "Aligned with the Nigeria Digital Health Architecture (NDHA) and the Nigeria Data Protection Act (2023).",
    },
  ];

  // Measurable 12-month outcomes from our roadmap.
  const outcomes = [
    "Pilot with 1 private clinic and 2 diagnostic centers in our first 12 months",
    "70% digital record-sharing within pilot facilities",
    "95% confidence score on OCR-driven evaluation of legacy paper files",
    "15% reduction in average patient waiting times via queue monitoring",
    "40% fewer duplicate records and less care discontinuity",
  ];

  return (
    <div className="flex flex-col">
      <AppNavbar />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center mt-6 sm:mt-10 gap-4 py-6 sm:py-8 md:py-16 px-4 sm:px-6 text-foreground">
        <div className="inline-block max-w-4xl text-center justify-center w-full">
          <div className="mb-3 sm:mb-4 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-semibold">
              🇳🇬 Built for Nigerian healthcare
            </span>
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-100 text-amber-700 rounded-full text-xs sm:text-sm font-semibold">
              In development • Piloting 2026
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-4 sm:mt-7 font-extrabold text-center leading-tight px-2">
            Reliable Point of Care Digitization{" "}
            <br className="hidden sm:block" />
            <span className="text-[#3d7e46]">for Healthcare Facilities</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-stone-700 mt-4 sm:mt-6 px-2">
            Small and medium healthcare facilities use {brand.name} online and
            offline to digitize patient paper records, secure data sharing,
            streamline clinical workflows, manage financial processes, enhance
            administration efficiency, and ultimately improve patient care
            outcomes.
          </p>

          <div className="w-full flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center py-4 mt-6 sm:mt-8 px-4">
            <Button
              as={brand.disableAuthButtons ? undefined : Link}
              className="flex items-center justify-center font-semibold text-white text-base sm:text-lg md:text-xl py-5 sm:py-6 px-6 sm:px-8 w-full sm:w-auto"
              color="primary"
              href={brand.disableAuthButtons ? undefined : "/auth/register"}
              isDisabled={brand.disableAuthButtons}
              variant="shadow"
            >
              Get Started <MoveRight className="ml-2" size={20} />
            </Button>

            <Button
              as={brand.disableAuthButtons ? undefined : Link}
              href={brand.disableAuthButtons ? undefined : "/auth/login"}
              isDisabled={brand.disableAuthButtons}
              className="w-full sm:w-auto border-green-700 text-green-700 hover:bg-green-50 font-semibold text-base sm:text-lg md:text-xl py-5 sm:py-6 px-6 sm:px-8"
              color="default"
              variant="bordered"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="flex flex-col items-center justify-center gap-4 pt-4 pb-10 sm:pb-16 px-4 sm:px-6 text-foreground">
        <div className="text-center max-w-3xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            When paper records fail, care fails
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-stone-700 mt-3 sm:mt-4 leading-relaxed">
            Across Nigeria&apos;s primary healthcare centers, private clinics,
            and diagnostic centers, patient records are still paper-based:
            fragmented, easily lost, and inaccessible across points of care.
            Enterprise EHRs exist, but they are expensive,
            internet-dependent, and built for large urban hospitals. The
            facilities that serve most Nigerians are left behind, driving
            repeated tests, medication errors, treatment delays, and weak
            disease surveillance.
          </p>
        </div>
      </section>

      {/* Stats / Problem Scale */}
      <section className="bg-green-50 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-green-700">
                  {stat.number}
                </div>
                <div className="text-gray-700 mt-1 sm:mt-2 font-medium text-xs sm:text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works (Core Pillars) */}
      <section className="flex flex-col items-center justify-center gap-4 py-10 sm:py-16 px-4 sm:px-6 text-foreground">
        <div className="text-center max-w-3xl mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            How {brand.name} works
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-semibold text-stone-700 mt-3 sm:mt-4">
            Three core capabilities, designed for the realities of underserved
            facilities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl w-full">
          {pillars.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative z-10 bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-green-100"
              >
                <div className="flex flex-col items-start text-left space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-600 flex items-center justify-center text-white">
                    <Icon size={26} />
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl text-zinc-800">
                    {item.title}
                  </h3>
                  <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 flex flex-col items-center justify-center gap-4 py-10 sm:py-16 px-4 sm:px-6 text-foreground">
        <div className="text-center max-w-3xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            What we&apos;re building
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-semibold text-stone-700 mt-4 sm:mt-6">
            An infrastructure-aware EHR tailored to low-to-medium resource
            facilities
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 py-8 sm:py-10 max-w-7xl w-full">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white py-6 sm:py-8 px-4 sm:px-5 flex flex-col space-y-4 sm:space-y-5 rounded-lg shadow-xl hover:shadow-2xl transition-shadow text-left border border-gray-100"
              >
                <div className="flex flex-col">
                  <Icon size={44} className="text-[#0d5117] mb-3 sm:mb-4" />
                  <span className="font-bold text-lg sm:text-xl text-zinc-800">
                    {feature.title}
                  </span>
                </div>
                <p className="text-zinc-600 text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recognition & Validation */}
      <section className="flex flex-col items-center justify-center gap-4 py-10 sm:py-16 px-4 sm:px-6 text-foreground">
        <div className="text-center max-w-3xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold px-2">
            Where we are today
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-semibold text-stone-700 mt-3 sm:mt-4">
            We are pre-launch, but the foundation is real, validated, and
            recognized
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8 mt-6 sm:mt-8 max-w-7xl w-full">
          {recognition.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-green-100 text-left"
              >
                <Icon size={32} className="text-green-600 mb-3" />
                <h3 className="font-bold text-base sm:text-lg text-zinc-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Impact & Outcomes */}
      <section className="bg-green-50 py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              The impact we&apos;re working toward
            </h2>
            <p className="text-base sm:text-lg text-stone-700 mt-3 sm:mt-4">
              Clear, measurable goals for our first 12 months of pilots.
            </p>
            <ul className="mt-6 space-y-3">
              {outcomes.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle
                    className="text-green-600 mt-0.5 flex-shrink-0"
                    size={20}
                  />
                  <span className="text-zinc-700 text-sm sm:text-base">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <p className="font-semibold text-zinc-800">
              Contributing to the UN Sustainable Development Goals:
            </p>
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md border border-green-100 flex items-start gap-4">
              <Activity className="text-green-600 flex-shrink-0" size={28} />
              <div>
                <h3 className="font-bold text-zinc-800">
                  SDG 3: Good Health & Well-being
                </h3>
                <p className="text-zinc-600 text-sm mt-1">
                  Reducing premature mortality from communicable and
                  non-communicable diseases through continuity of care.
                </p>
              </div>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md border border-green-100 flex items-start gap-4">
              <Building2 className="text-green-600 flex-shrink-0" size={28} />
              <div>
                <h3 className="font-bold text-zinc-800">
                  SDG 9: Industry, Innovation & Infrastructure
                </h3>
                <p className="text-zinc-600 text-sm mt-1">
                  Building resilient digital health infrastructure for the
                  facilities still reliant on paper.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Now */}
      <section className="flex flex-col items-center justify-center gap-4 py-10 sm:py-16 px-4 sm:px-6 text-foreground">
        <div className="text-center max-w-3xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Why now
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-stone-700 mt-4 sm:mt-6 leading-relaxed">
            Nigeria has reached a policy turning point with the launch of the
            Nigeria Digital Health Architecture (NDHA), an urgent mandate to
            bridge paper-based records and a unified national health ecosystem.
            The Ministry of Health&apos;s call for private-sector agility, the
            need for patient-centered interoperability, and the readiness of
            cloud-native, offline-capable systems make this the moment to act.
          </p>
        </div>
      </section>

      {/* Mission / Final CTA */}
      <section className="flex flex-col items-center justify-center gap-4 py-10 sm:py-16 px-4 sm:px-6 text-foreground bg-[#0d5117]">
        <div className="text-center py-6 sm:py-7 max-w-4xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl mt-4 sm:mt-7 font-bold text-white">
            Our mission
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-100 mt-4 sm:mt-6 leading-relaxed">
            To improve care outcomes, and provide care continuity through an
            affordable digital electronic health record system for
            low-to-medium healthcare facilities in Nigeria.
          </p>

          <div className="mx-auto pt-6 sm:pt-7 max-w-md">
            <Button
              as={brand.disableAuthButtons ? undefined : Link}
              href={brand.disableAuthButtons ? undefined : "/auth/register"}
              isDisabled={brand.disableAuthButtons}
              className="flex items-center justify-center bg-white font-semibold text-[#0d5117] text-base sm:text-lg md:text-xl py-5 sm:py-6 w-full"
              variant="shadow"
              radius="md"
              size="lg"
            >
              Get Started <MoveRight className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
