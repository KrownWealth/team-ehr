import ImageFolder from "@/components/custom/table/ImageFolder";
import Gradient1 from "@/components/reusables/Gradient1";
import Link from "next/link";
import React from "react";

function Banner() {
  return (
    <div className="bg-primary/90 text-white rounded-2xl gap-12 md:gap-20 flex flex-col justify-between md:rounded-[33px] min-h-[calc(100svh-28px)] w-full p-6 pt-30 md:pt-36 pb-0 relative overflow-hidden">
      <div className="space-y-7 text-center mx-auto relative z-20">
        <h1 className="text-4xl sm:text-5xl lg:text-8xl font-bold">
          Focus on Patients, <br />
          not paperwork
        </h1>
        <p className="mx-auto max-w-xl font-semibold text-lg lg:text-xl">
          Digitize patient records instantly with AI-powered EHR built for
          Africa. Stop losing files. Start saving lives. Setup in 15 minutes.
        </p>
        <Link
          href={"/auth/register"}
          className="bg-white text-primary px-6 lg:px-7 py-3 w-fit mx-auto font-semibold lg:text-lg rounded-full btn mx-auto"
        >
          Sign up for free
        </Link>
      </div>

      <ImageFolder images={sampleData} title="wecareEHR Screenshots" />

      <Gradient1 />
    </div>
  );
}

export default Banner;

const sampleData = {
  desktop: [
    {
      src: "/images/shot-1.png",
      alt: "Dashboard Overview",
      label: "Dashboard Overview",
      description: "Main clinic dashboard with real-time metrics",
    },
    {
      src: "/images/shot-2.png",
      alt: "Patient Registration",
      label: "Patient Registration",
      description: "Quick patient registration with NIN validation",
    },
    {
      src: "/images/shot-3.png",
      alt: "Queue Management",
      label: "Queue Management",
      description: "Real-time patient queue tracking",
    },
    {
      src: "/images/shot-4.png",
      alt: "Consultation Notes",
      label: "Doctor Consultation",
      description: "SOAP notes and prescription management",
    },
    {
      src: "/images/shot-5.png",
      alt: "Consultation Notes",
      label: "Doctor Consultation",
      description: "SOAP notes and prescription management",
    },
  ],
  mobile: [
    {
      src: "/images/shot-1-m.png",
      alt: "Mobile Dashboard",
      label: "Mobile Dashboard",
      description: "Dashboard optimized for mobile devices",
    },
    {
      src: "/images/shot-2-m.png",
      alt: "Mobile Patient List",
      label: "Patient List",
      description: "Browse patients on the go",
    },
    {
      src: "/images/shot-3-m.png",
      alt: "Mobile Vitals",
      label: "Record Vitals",
      description: "Quick vitals recording interface",
    },
    {
      src: "/images/shot-4-m.png",
      alt: "Mobile Queue",
      label: "Queue View",
      description: "See patient queue in real-time",
    },
    {
      src: "/images/shot-5-m.png",
      alt: "Consultation Notes",
      label: "Doctor Consultation",
      description: "SOAP notes and prescription management",
    },
  ],
};
