"use client";

import * as React from "react";
import { Button, Link } from "@heroui/react";
import { User } from "@heroui/react";
import {
  Carousel,
  CarouselItem,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousels";
import {
  Calendar,
  MoveRight,
  Users,
  Activity,
  FileText,
  CheckCircle,
  Shield,
  Clock,
  Smartphone,
  BarChart3,
  Zap,
  UserPlus,
  ClipboardList,
  Heart,
} from "lucide-react";

import Footer from "@/components/reusables/footer/Footer";
import AppNavbar from "@/components/reusables/customUI/header";

export default function LandingPage() {
  const features = [
    {
      icon: Calendar,
      title: "Appointment Management",
      description:
        "Schedule and manage patient appointments with automated SMS reminders for Nigerian patients.",
    },
    {
      icon: Users,
      title: "Staff Management",
      description:
        "Efficiently manage doctors, nurses, and administrative staff with role-based access control.",
    },
    {
      icon: Activity,
      title: "Patient Records",
      description:
        "Secure digital patient records with comprehensive health history tracking and NHIS integration.",
    },
    {
      icon: FileText,
      title: "Reports & Analytics",
      description:
        "Generate FMOH-compliant reports and gain insights into clinic performance and patient outcomes.",
    },
    {
      icon: Shield,
      title: "Data Security",
      description:
        "Bank-level encryption and NDPR compliance to protect sensitive patient information.",
    },
    {
      icon: Smartphone,
      title: "Mobile Access",
      description:
        "Access your clinic management system anywhere, anytime on any device with internet.",
    },
  ];

  const howItWorksSteps = [
    {
      step: 1,
      icon: UserPlus,
      title: "Register Your Clinic",
      description:
        "Sign up in 3 minutes with your clinic details and admin information. No paperwork required.",
    },
    {
      step: 2,
      icon: Users,
      title: "Add Your Team",
      description:
        "Invite doctors, nurses, and staff members. Set permissions based on their roles.",
    },
    {
      step: 3,
      icon: ClipboardList,
      title: "Register Patients",
      description:
        "Add patient records digitally. Import existing records or start fresh with new registrations.",
    },
    {
      step: 4,
      icon: Heart,
      title: "Start Treating Patients",
      description:
        "Manage consultations, prescriptions, lab orders, and billing all in one place.",
    },
  ];

  const nigerianFeatures = [
    {
      title: "NHIS Integration Ready",
      description:
        "Prepare for seamless integration with the National Health Insurance Scheme.",
    },
    {
      title: "Local Payment Options",
      description:
        "Accept payments via bank transfer, POS, and popular Nigerian payment gateways.",
    },
    {
      title: "SMS Notifications",
      description:
        "Automated appointment reminders via SMS for patients across all Nigerian networks.",
    },
    {
      title: "Multiple Locations",
      description:
        "Manage multiple clinic branches across Nigeria from a single dashboard.",
    },
    {
      title: "Naira Pricing",
      description:
        "All pricing and billing in Nigerian Naira with no hidden charges.",
    },
    {
      title: "Local Support",
      description:
        "Nigerian-based customer support team available via phone, WhatsApp, and email.",
    },
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer, Hope Clinic, Lagos",
      message:
        "WecareEHR transformed our clinic operations. Patient wait times reduced by 40% and we can now see 30% more patients daily. The system is intuitive and our staff adapted quickly.",
      avatar:
        "https://images.unsplash.com/photo-1512361436605-a484bdb34b5f?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=500",
    },
    {
      name: "Dr. Michael Adeyemi",
      role: "Managing Partner, SmileCare Dental, Abuja",
      message:
        "As a dental practice, we needed something specialized yet flexible. WecareEHR delivered beyond expectations. Our revenue tracking and patient management are now seamless.",
      avatar:
        "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=500",
    },
    {
      name: "Nurse Bentley Okeke",
      role: "Lead Nurse, Grace Medical Center, Port Harcourt",
      message:
        "The vitals recording and queue management features save us hours daily. Everything flows smoothly from patient check-in to consultation. Highly recommended!",
      avatar:
        "https://media.istockphoto.com/id/1390000431/photo/shot-of-a-mature-doctor-using-a-digital-tablet-in-a-modern-hospital.webp?a=1&b=1&s=612x612&w=0&k=20&c=ObBKK9a_LJZZRH0isnIiX8YUCNpZQ6rBKoGbo_Z8vnk=",
    },
  ];

  const stats = [
    { number: "500+", label: "Healthcare Facilities" },
    { number: "50,000+", label: "Patients Served" },
    { number: "1,000+", label: "Healthcare Professionals" },
    { number: "99.9%", label: "Uptime Guarantee" },
  ];

  return (
    <div className="flex flex-col">
      <AppNavbar />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center mt-10 gap-4 py-8 px-6 md:py-16 text-foreground">
        <div className="inline-block max-w-4xl text-center justify-center">
          <div className="mb-4">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              🇳🇬 Built for Nigerian Healthcare
            </span>
          </div>
          <h1 className="xl:text-6xl text-5xl md:text-nowrap text-wrap mt-7 font-extrabold text-center">
            Modern Clinic Management <br />
            <span className="text-[#3d7e46]">&nbsp;Made Simple</span>
          </h1>
          <p className="md:text-2xl text-xl font-semibold text-stone-700 mt-6">
            Join 500+ Nigerian healthcare facilities using WecareEHR to deliver
            better patient care, streamline operations, and grow their practice.
          </p>

          <div className="flex items-center justify-center space-x-8 py-4 mt-8">
            <Button
              as={Link}
              className="flex items-center justify-center font-semibold text-white md:text-xl text-lg py-6 px-8"
              color="primary"
              href="/auth/register"
              variant="shadow"
            >
              Start Free 30-Day Trial <MoveRight />
            </Button>

            <Button
              as={Link}
              href="/auth/login"
              className="border-green-700 text-green-700 hover:bg-green-50 font-semibold md:text-xl text-lg py-6 px-8"
              color="default"
              variant="bordered"
            >
              Sign In
            </Button>
          </div>

          <p className="text-sm text-gray-600 mt-4">
            No credit card required • Cancel anytime • Nigerian support team
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-green-50 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-green-700">
                  {stat.number}
                </div>
                <div className="text-gray-700 mt-2 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-foreground">
        <div className="text-center max-w-3xl mb-12">
          <h2 className="md:text-5xl text-4xl font-bold">How It Works</h2>
          <p className="sm:text-xl text-lg font-semibold text-stone-700 mt-4">
            Get your clinic up and running in 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl">
          {howItWorksSteps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="relative">
                {/* Connector line for desktop */}
                {index < howItWorksSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-green-200 z-0" />
                )}

                <div className="relative z-10 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-green-100">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xl">
                      {item.step}
                    </div>
                    <Icon size={40} className="text-green-600" />
                    <h3 className="font-bold text-xl text-zinc-800">
                      {item.title}
                    </h3>
                    <p className="text-zinc-600 text-sm">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Nigerian-Specific Features */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="md:text-5xl text-4xl font-bold">
              Built for Nigerian Clinics
            </h2>
            <p className="sm:text-xl text-lg font-semibold text-stone-700 mt-4">
              Features designed specifically for the Nigerian healthcare system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nigerianFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-lg text-zinc-800 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-foreground">
        <div className="text-center">
          <h2 className="md:text-5xl text-4xl font-bold">
            Everything You Need to Run Your Clinic
          </h2>
          <p className="sm:text-xl text-lg font-semibold text-stone-700 mt-6 max-w-3xl mx-auto">
            Comprehensive features to handle every aspect of your healthcare
            facility
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-10 max-w-7xl">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white py-8 px-5 flex flex-col space-y-5 rounded-lg shadow-xl hover:shadow-2xl transition-shadow text-left border border-gray-100"
                >
                  <div className="flex flex-col">
                    <Icon
                      size={60}
                      className="text-[#0d5117] font-extrabold mb-4"
                    />
                    <span className="font-bold text-xl text-zinc-800">
                      {feature.title}
                    </span>
                  </div>
                  <p className="text-zinc-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-green-50 flex flex-col items-center justify-center gap-4 py-16 px-6 text-foreground">
        <div className="text-center">
          <h2 className="md:text-5xl text-4xl font-bold">
            Trusted by Healthcare Professionals Across Nigeria
          </h2>
          <p className="sm:text-xl text-lg font-semibold text-stone-700 mt-4">
            See what clinic owners and healthcare professionals are saying
          </p>
        </div>

        <div className="flex items-center justify-center w-full mt-8 py-6">
          <Carousel className="max-w-md md:max-w-3xl w-full">
            <CarouselContent>
              {testimonials.map((item, index) => (
                <CarouselItem
                  key={index}
                  className="flex items-center justify-center text-center w-full px-4"
                >
                  <div className="flex flex-col items-center text-center space-y-6 px-6 bg-white rounded-xl shadow-lg py-8">
                    <User
                      name={item.name}
                      description={item.role}
                      avatarProps={{
                        src: item.avatar,
                        className: "w-16 h-16",
                      }}
                      className="justify-center"
                    />

                    <p className="text-lg text-zinc-700 max-w-2xl leading-relaxed">
                      "{item.message}"
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="flex justify-center gap-4 mt-8">
              <CarouselPrevious className="relative left-0" />
              <CarouselNext className="relative right-0" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Pricing Highlight */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="md:text-5xl text-4xl font-bold mb-6">
            Simple, Transparent Pricing
          </h2>
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-12 shadow-2xl">
            <div className="text-6xl font-bold mb-4">₦15,000</div>
            <div className="text-2xl mb-6">per month</div>
            <div className="space-y-3 text-lg mb-8">
              <p>✓ Unlimited patients and staff</p>
              <p>✓ All features included</p>
              <p>✓ Nigerian phone & WhatsApp support</p>
              <p>✓ Free setup assistance</p>
              <p>✓ 30-day free trial</p>
            </div>
            <Button
              as={Link}
              href="/auth/register"
              className="bg-white text-green-700 hover:bg-gray-100 font-bold text-xl py-6 px-8"
              size="lg"
            >
              Start Your Free Trial
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-foreground bg-[#0d5117]">
        <div className="text-center py-7 max-w-4xl">
          <h2 className="capitalize md:text-5xl text-4xl mt-7 font-bold text-white">
            Ready to Transform Your Clinic?
          </h2>
          <p className="sm:text-xl text-lg font-semibold text-gray-100 mt-6">
            Join hundreds of Nigerian healthcare providers modernizing their
            practice with WecareEHR. Start your free 30-day trial today.
          </p>

          <div className="mx-auto pt-7 max-w-md">
            <Button
              as={Link}
              href="/auth/register"
              className="flex items-center justify-center bg-white font-semibold text-[#0d5117] md:text-xl text-lg py-6 w-full"
              variant="shadow"
              radius="md"
              size="lg"
            >
              Get Started Free <MoveRight className="ml-2" />
            </Button>
          </div>

          <p className="text-gray-300 mt-4">
            Questions? Call us on +234 800 123 4567 or WhatsApp
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}