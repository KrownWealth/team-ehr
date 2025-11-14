"use client";

import * as React from "react";
import { Button, Link } from "@heroui/react";
import { User } from "@heroui/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import {
  Calendar,
  MoveRight,
  Users,
  Activity,
  FileText,
  CheckCircle,
} from "lucide-react";

import Footer from "@/components/reusables/footer/Footer";
import { GeneralSans_Regular } from "@/lib";

export default function LandingPage() {
  const features = [
    {
      icon: Calendar,
      title: "Appointments",
      description:
        "Easily schedule and manage patient appointments with automated reminders.",
    },
    {
      icon: Users,
      title: "Staff Management",
      description:
        "Add, edit, and manage staff records efficiently from a central dashboard.",
    },
    {
      icon: Activity,
      title: "Patient Monitoring",
      description:
        "Track vitals, monitor health progress, and manage patient data securely.",
    },
    {
      icon: FileText,
      title: "Reports & Analytics",
      description:
        "Comprehensive insights and analytics to make data-driven decisions.",
    },
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer, Hope Clinic",
      message:
        "This platform completely transformed how we manage patient records and appointments. The efficiency has been unmatched!",
      avatar:
        "https://images.unsplash.com/photo-1512361436605-a484bdb34b5f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGJsYWNrJTIwZ2lybHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=500",
    },

    {
      name: "Dr. Michael Adeyemi",
      role: "Dentist, SmileCare",
      message:
        "The simplicity and performance of this system blew my mind. Managing appointments has never been easier.",
      avatar:
        "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmxhY2slMjBtYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=500",
    },

    {
      name: "Nurse Bentley Okeke",
      role: "Lead Nurse, Grace Medical Center",
      message:
        "I love how intuitive this system is. From patient intake to follow-up, everything is seamless and stress-free.",
      avatar:
        "https://media.istockphoto.com/id/1390000431/photo/shot-of-a-mature-doctor-using-a-digital-tablet-in-a-modern-hospital.webp?a=1&b=1&s=612x612&w=0&k=20&c=ObBKK9a_LJZZRH0isnIiX8YUCNpZQ6rBKoGbo_Z8vnk=",
    },

    {
      name: "Dr. John Stewart",
      role: "Pediatrician, City Children Hospital",
      message:
        "This system has simplified patient record management so much that I now focus more on care instead of paperwork. It’s smooth and reliable!",
      avatar: "https://randomuser.me/api/portraits/women/54.jpg",
    },

    {
      name: "Nurse Jessica Okon",
      role: "Ward Supervisor, FaithCare Hospital",
      message:
        "The platform has brought order to our daily workflow. The reminders, patient tracking, and reports save us hours every week.",
      avatar: "https://randomuser.me/api/portraits/women/51.jpg",
    },

    {
      name: "Dr. Emmanuel Chike",
      role: "General Practitioner, Harmony Health",
      message:
        "I was amazed at how easy it was to navigate. From appointment booking to follow-up, everything feels connected and effortless.",
      avatar: "https://randomuser.me/api/portraits/men/57.jpg",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center mt-10 gap-4 py-8 px-6 md:py-16 text-foreground">
        <div className="inline-block max-w-4xl text-center justify-center">
          <h1
            className={`${GeneralSans_Regular.className} "xl:text-6xl text-5xl md:text-nowrap text-wrap mt-7 font-bold font-inter text-center"`}
          >
            Manage Your Clinic
            <span className="text-primary-600">&nbsp;Digitally</span>
          </h1>
          <p className="md:text-2xl text-xl font-semibold text-gray-100 mt-6">
            A comprehensive healthcare management platform designed for modern
            hospitals and clinics. Streamline operations, improve patient care,
            and boost efficiency.
          </p>

          <div className="flex items-center justify-center space-x-8 py-4 mt-8">
            <Button
              as={Link}
              className="flex items-center justify-center font-semibold text-white md:text-xl text-lg py-6"
              color="primary"
              variant="shadow"
            >
              Start free trial <MoveRight />
            </Button>

            <Button
              as={Link}
              className="flex items-center justify-center font-semibold text-white md:text-xl text-lg py-6"
              color="default"
              variant="shadow"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Power Features */}
      <section className="flex flex-col items-center justify-center gap-4 py-8 px-6 md:py-10 text-foreground">
        <div className="text-center">
          <h2 className="md:text-5xl text-4xl mt-7 font-bold">
            Powerful Features
          </h2>
          <p className="sm:text-xl text-lg font-semibold text-gray-100 mt-6">
            Everything you need to run your healthcare facility efficiently
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-10">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white py-8 px-5 flex flex-col space-y-5 rounded-lg drop-shadow-2xl text-left"
                >
                  <div className="flex flex-col">
                    <Icon
                      size={70}
                      className="text-primary-400 font-extrabold mb-4"
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

      {/* why choose us */}
      <section className="flex flex-col items-center justify-center gap-4 py-8 px-6 md:py-10 text-foreground">
        <div className="text-center">
          <h2 className="md:text-5xl text-4xl mt-7 font-bold">
            Why Choose HealthCare+
          </h2>
          <div className="grid md:grid-cols-3 grid-cols-2 md:grid-rows-2 grid-rows-3 py-5 mt-9 gap-y-5 md:gap-x-10 gap-x-4">
            <div className="flex space-x-3.5 text-left">
              <CheckCircle size={30} className="text-emerald-600" />{" "}
              <span>HIPAA Compliant & Secure</span>
            </div>

            <div className="flex space-x-3.5">
              <CheckCircle size={30} className="text-emerald-600" />{" "}
              <span>24/7 Customer Support</span>
            </div>

            <div className="flex space-x-3.5">
              <CheckCircle size={30} className="text-emerald-600" />{" "}
              <span>Easy Integration</span>
            </div>

            <div className="flex space-x-3.5">
              <CheckCircle size={30} className="text-emerald-600" />{" "}
              <span>Cloud-Based Access</span>
            </div>

            <div className="flex space-x-3.5">
              <CheckCircle size={30} className="text-emerald-600" />{" "}
              <span>Real-Time Updates</span>
            </div>

            <div className="flex space-x-3.5">
              <CheckCircle size={30} className="text-emerald-600" />{" "}
              <span>Cost-Effective Solution</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="flex flex-col items-center justify-center gap-4 py-8 px-6 md:py-10 overflow-hidden text-foreground">
        <div className="text-center">
          <h2 className="md:text-5xl text-4xl mt-7 font-bold">
            What Our Users Say
          </h2>
        </div>
        <div className="flex items-center justify-center w-full mt-8 py-6">
          <Carousel className="max-w-md md:max-w-3xl w-full">
            <CarouselContent>
              {testimonials.map((item, index) => (
                <CarouselItem
                  key={index}
                  className="flex items-center justify-center text-center w-full px-4"
                >
                  <div className="flex flex-col items-center text-center space-y-6 px-6">
                    <User
                      name={item.name}
                      description={item.role}
                      avatarProps={{
                        src: item.avatar,
                        className: "w-16 h-16",
                      }}
                      className="justify-center"
                    />

                    <p className="text-lg text-zinc-600 max-w-2xl leading-relaxed">
                      “{item.message}”
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Carousel Controls */}
            <div className="flex justify-center gap-4 mt-8">
              <CarouselPrevious className="relative left-0" />
              <CarouselNext className="relative right-0" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* CTA */}

      <section className="flex flex-col items-center justify-center gap-4 py-8 px-6 md:py-10 text-foreground bg-blue-600">
        <div className="text-center py-7">
          <h2 className="capitalize md:text-5xl text-4xl mt-7 font-bold">
            ready to get started?
          </h2>
          <p className="sm:text-xl text-lg font-semibold text-gray-100 mt-6">
            Join thousands of healthcare providers who trust HealthCare+ for
            their practice management
          </p>

          <div className="mx-auto pt-7 sm:w-[30%] w-[40%]">
            <Button
              as={Link}
              href="/signup"
              className="flex items-center justify-center bg-white font-semibold text-primary-200 md:text-xl text-lg py-6"
              variant="shadow"
              radius="md"
            >
              Start free trial <MoveRight />
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
